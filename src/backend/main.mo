import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ConversationId = Nat;

  type Message = {
    id : Nat;
    encryptedContent : Text;
    role : Text;
    timestamp : Int;
  };

  type Conversation = {
    id : ConversationId;
    title : Text;
    messages : [Message];
    createdAt : Int;
    updatedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Conversation {
    public func compare(c1 : Conversation, c2 : Conversation) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  let conversations = Map.empty<Principal, Map.Map<ConversationId, Conversation>>();
  var conversationIdCounter : ConversationId = 0;

  var openAiApiKey : ?Text = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireAuth(caller);
    userProfiles.add(caller, profile);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func setApiKey(apiKey : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set API key");
    };
    openAiApiKey := ?apiKey;
  };

  func getUserConversations(caller : Principal) : Map.Map<ConversationId, Conversation> {
    switch (conversations.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userConversations) { userConversations };
    };
  };

  func getConversationInternal(userConversations : Map.Map<ConversationId, Conversation>, conversationId : ConversationId) : Conversation {
    switch (userConversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conversation) { conversation };
    };
  };

  public shared ({ caller }) func createConversation(title : Text) : async ConversationId {
    requireAuth(caller);
    if (title.size() > 100) { Runtime.trap("Title too long") };
    let newId = conversationIdCounter;
    conversationIdCounter += 1;
    let conversation : Conversation = {
      id = newId;
      title;
      messages = [];
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    switch (conversations.get(caller)) {
      case (null) {
        let newMap = Map.empty<ConversationId, Conversation>();
        newMap.add(newId, conversation);
        conversations.add(caller, newMap);
        return newId;
      };
      case (?existing) {
        existing.add(newId, conversation);
        return newId;
      };
    };
  };

  public query ({ caller }) func getConversations() : async [Conversation] {
    requireAuth(caller);
    let userConversations = switch (conversations.get(caller)) {
      case (null) { Map.empty<ConversationId, Conversation>() };
      case (?convs) { convs };
    };
    userConversations.values().toArray().sort();
  };

  public query ({ caller }) func getConversation(conversationId : ConversationId) : async Conversation {
    requireAuth(caller);
    let userConversations = getUserConversations(caller);
    getConversationInternal(userConversations, conversationId);
  };

  public shared ({ caller }) func updateConversation(conversationId : ConversationId, title : Text, encryptedMessages : [Text]) : async () {
    requireAuth(caller);
    if (title.size() > 100) { Runtime.trap("Title too long") };
    let userConversations = getUserConversations(caller);
    let conversation = getConversationInternal(userConversations, conversationId);
    let messages = encryptedMessages.map<Text, Message>(
      func(content : Text) {
        {
          id = 0;
          encryptedContent = content;
          role = "";
          timestamp = Time.now();
        };
      }
    );
    let updatedConversation : Conversation = {
      id = conversation.id;
      title;
      messages;
      createdAt = conversation.createdAt;
      updatedAt = Time.now();
    };
    userConversations.add(conversationId, updatedConversation);
  };

  public shared ({ caller }) func deleteConversation(conversationId : ConversationId) : async () {
    requireAuth(caller);
    let userConversations = switch (conversations.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?convs) { convs };
    };
    if (not userConversations.containsKey(conversationId)) { Runtime.trap("Conversation not found") };
    userConversations.remove(conversationId);
  };
};
