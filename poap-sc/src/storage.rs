use multiversx_sc::imports::*;
use crate::types::{Event, EventId};

#[multiversx_sc::module]
pub trait StorageModule {
    // --- Storage ---
    // Global event ID counter
    #[storage_mapper("last_event_id")]
    fn last_event_id(&self) -> SingleValueMapper<u64>;

    // The active event of each organizer (empty if it has no active event)
    #[storage_mapper("event_by_organizer")]
    fn event_by_organizer(&self, organizer: &ManagedAddress) -> SingleValueMapper<u64>;

    // Stored data of all the created events
    #[storage_mapper("events")]
    fn events(&self, event_id: EventId) -> SingleValueMapper<Event<Self::Api>>;

    // Claimed event registry, stores a bool per EVENT per ADDRESS
    #[storage_mapper("has_claimed")]
    fn has_claimed(&self, event_id: EventId, address: &ManagedAddress) -> SingleValueMapper<bool>;

    // Token POAP used to mint the SFTs
    #[storage_mapper("token_identifier")]
    fn token_identifier(&self) -> SingleValueMapper<TokenIdentifier>;

    // --- Getters ---
    // Does this address have an active event?
    fn has_active_event(&self, address: &ManagedAddress) -> bool {
        !self.event_by_organizer(&address).is_empty()
    }

    // Get the active event_id of this address (empty if it has no active event)
    fn get_active_event_id(&self, address: &ManagedAddress) -> EventId {
        self.event_by_organizer(&address).get()
    }

    // Get the event struct based on it's event_id
    fn get_event_by_id(&self, event_id: EventId) -> Event<Self::Api> {
        self.events(event_id).get()
    }

    // Has this address already claimed the event?
    fn has_claimed_event(&self, event_id: EventId, address: &ManagedAddress) -> bool {
        self.has_claimed(event_id, &address).get()
    }

    // Get a new event_id increased by 1
    fn get_new_event_id(&self) -> EventId {
        let event_id: u64 = self.last_event_id().get() + 1u64;
        self.last_event_id().set(event_id);
        event_id
    }
}