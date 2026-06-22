use multiversx_sc::imports::*;
use crate::types::{Event, EventId};

#[multiversx_sc::module]
pub trait ViewsModule: crate::storage::StorageModule {
    fn date(&self) -> TimestampMillis {
        self.blockchain().get_block_timestamp_millis()
    }

    // Returns the data of the current active event of an address
    #[view(getActiveEvent)]
    fn get_active_event_view(&self, organizer: ManagedAddress) -> OptionalValue<Event<Self::Api>> {
        if !self.has_active_event(&organizer) {
            return OptionalValue::None;
        }

        let event_id = self.get_active_event_id(&organizer);
        let event = self.get_event_by_id(event_id);

        // Return event only if it's active
        if event.is_active(self.date()) {
            return OptionalValue::Some(event);
        }

        OptionalValue::None
    }

    // Check if an event has been claimed by an address
    #[view(hasClaimed)]
    fn has_claimed_view(&self, event_id: EventId, address: ManagedAddress) -> bool {
        self.has_claimed_event(event_id, &address)
    }
}