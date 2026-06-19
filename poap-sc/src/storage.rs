use multiversx_sc::imports::*;
use crate::types::{Event};

#[multiversx_sc::module]
pub trait StorageModule {
    // Global event ID counter
    #[storage_mapper("last_event_id")]
    fn last_event_id(&self) -> SingleValueMapper<u64>;

    // The active event of each organizer (empty if it has no active event)
    #[storage_mapper("event_by_organizer")]
    fn event_by_organizer(&self, organizer: &ManagedAddress) -> SingleValueMapper<u64>;

    // Stored data of all the created events
    #[storage_mapper("events")]
    fn events(&self, event_id: u64) -> SingleValueMapper<Event<Self::Api>>;

    // Claimed event registry, stores a bool per EVENT per ADDRESS
    #[storage_mapper("has_claimed")]
    fn has_claimed(&self, event_id: u64, address: &ManagedAddress) -> SingleValueMapper<bool>;

    // Token POAP used to mint the SFTs
    #[storage_mapper("token_identifier")]
    fn token_identifier(&self) -> SingleValueMapper<TokenIdentifier>;
}