use multiversx_sc::imports::*;
use multiversx_sc::derive_imports::*;

pub type EventId = u64;

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Event<M: ManagedTypeApi> {
    pub event_id: EventId,              // Event Id
    pub name: ManagedBuffer<M>,         // Event name/title
    pub emblem_url: ManagedBuffer<M>,   // URL of the emblem's image
    pub start_date: TimestampMillis,    // Creation/start date of the event

    pub end_date: TimestampMillis,      // Expiration date, the event is only valid until then
    pub is_stopped: bool,               // True to stop the event, no matter the value of "end_date" or "current_participants"
    pub max_participants: u64,          // The max amount of emblems distributed, limited from 0 to 1000
    pub current_participants: u64,      // Number of claims realized until now
    pub token_nonce: u64,               // nonce of the minted SFT for the event
    pub organizer: ManagedAddress<M>,   // Address of the organizer
}

impl<M: ManagedTypeApi> Event<M> {
    pub fn new(
        event_id: EventId,
        name: ManagedBuffer<M>,
        emblem_url: ManagedBuffer<M>,
        start_date: TimestampMillis,
        end_date: TimestampMillis,
        max_participants: u64,
        token_nonce: u64,
        organizer: ManagedAddress<M>,
    ) -> Self {
        Self {
            event_id,
            name,
            emblem_url,
            start_date,
            end_date,
            is_stopped: false,
            max_participants,
            current_participants: 0,
            token_nonce,
            organizer: organizer,
        }
    }

    // The event is active if: it's not stopped, it's within the deadline (end_date) and there are remaining participants
    pub fn is_active(&self, date: TimestampMillis) -> bool {
        self.is_not_stopped() && self.is_not_expired(date) && self.is_not_full()
    } 

    // Returns false when the event gets finalized by the organizer or the end_date is reached 
    pub fn is_not_stopped(&self) -> bool {
        !self.is_stopped
    }

    // Whether the end_date was reached or not
    pub fn is_not_expired(&self, date: TimestampMillis) -> bool {
        self.end_date > date
    }

    // Whether there's any SFT left to claim
    pub fn is_not_full(&self) -> bool {
        self.current_participants < self.max_participants
    }

    // Amount of participants that can join before hitting the limit
    pub fn remaining_participants(&self) -> u64 {
        self.max_participants - self.current_participants
    }
}