import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Conversation,
  ConversationId,
  backendInterface,
} from "../backend";
import { useActor } from "./useActor";

const RETRYABLE_ERRORS = [
  "actor not ready",
  "ic0508",
  "canister",
  "503",
  "502",
];

async function retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError: unknown;
  for (let i = 0; i <= delays.length; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const msg = (
        err instanceof Error ? err.message : String(err)
      ).toLowerCase();
      const isRetryable = RETRYABLE_ERRORS.some((e) => msg.includes(e));
      if (!isRetryable || i === delays.length) throw err;
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  throw lastError;
}

async function waitForActor(
  queryClient: ReturnType<typeof useQueryClient>,
  currentActor: backendInterface | null,
): Promise<backendInterface> {
  if (currentActor) return currentActor;

  const queries = queryClient.getQueriesData<backendInterface>({
    queryKey: ["actor"],
  });
  const cached = queries.find(([, v]) => v != null)?.[1];
  if (cached) return cached;

  // Wait up to 60s for actor to become ready
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Actor not ready. Please try again."));
    }, 60000);

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const qs = queryClient.getQueriesData<backendInterface>({
        queryKey: ["actor"],
      });
      const actor = qs.find(([, v]) => v != null)?.[1];
      if (actor) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(actor);
      }
    });
  });
}

export function useConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useConversation(id: ConversationId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation>({
    queryKey: ["conversation", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No id");
      return actor.getConversation(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateConversation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const a = await waitForActor(qc, actor);
      return retryWithBackoff(() => a.createConversation(title));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useDeleteConversation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ConversationId) => {
      const a = await waitForActor(qc, actor);
      return retryWithBackoff(() => a.deleteConversation(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useUpdateConversation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      encryptedMessages,
    }: {
      id: ConversationId;
      title: string;
      encryptedMessages: string[];
    }) => {
      const a = await waitForActor(qc, actor);
      return retryWithBackoff(() =>
        a.updateConversation(id, title, encryptedMessages),
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["conversation", vars.id.toString()] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSetApiKey() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      const a = await waitForActor(qc, actor);
      return retryWithBackoff(() => a.setApiKey(key));
    },
  });
}
