import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ConversationId = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    id: bigint;
    encryptedContent: string;
    role: string;
    timestamp: bigint;
}
export interface Conversation {
    id: ConversationId;
    title: string;
    messages: Array<Message>;
    createdAt: bigint;
    updatedAt: bigint;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConversation(title: string): Promise<ConversationId>;
    deleteConversation(conversationId: ConversationId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(conversationId: ConversationId): Promise<Conversation>;
    getConversations(): Promise<Array<Conversation>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApiKey(apiKey: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateConversation(conversationId: ConversationId, title: string, encryptedMessages: Array<string>): Promise<void>;
}
