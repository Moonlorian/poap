use multiversx_sc::imports::*;
use crate::types::{Event, EventId};

#[multiversx_sc::module]
pub trait EndpointsModule: crate::storage::StorageModule {
    fn date(&self) -> TimestampMillis {
        self.blockchain().get_block_timestamp_millis()
    }

    fn organizer(&self) -> ManagedAddress {
        self.blockchain().get_caller()
    }

    fn mint_sfts(&self, count: u64, name: &ManagedBuffer, event_id: EventId) -> u64 {
        self.send().esdt_nft_create(
            &self.token_identifier().get(),
            &BigUint::from(count),
            &name,
            &BigUint::zero(),       // No royalties
            &ManagedBuffer::new(),  // No hash
            &event_id,              // Event ID as the attribute
            &ManagedVec::new(),     // No URI, it is stored in the Event struct
        )
    }

    fn transfer_sft(&self, recipient: &ManagedAddress, token_nonce: u64) {
        self.send().direct_esdt(
            recipient,
            &self.token_identifier().get(),
            token_nonce,
            &BigUint::from(1u64),
        );
    }

    fn burn_sfts(&self, event: &Event<Self::Api>) {
        let token_nonce = event.token_nonce;
        let amount = event.remaining_participants();

        if amount > 0u64 {
            self.send().esdt_local_burn(
                &self.token_identifier().get(),
                token_nonce,
                &BigUint::from(amount),
            );
        }
    }

    fn deactivate_event(&self, organizer: &ManagedAddress) {
        let event_id = self.get_active_event_id(&organizer);
        let mut event = self.get_event_by_id(event_id);

        // Burn the SFTs and remove the event from the organizer
        self.burn_sfts(&event);
        self.event_by_organizer(&organizer).clear();

        // Stop event and store it's state
        event.is_stopped = true;
        self.events(event_id).set(event);
    }

    // Creates a new event and mints all the needed SFTs
    #[endpoint(createEvent)]
    fn create_event(&self, name: ManagedBuffer, url: ManagedBuffer, end_date: TimestampMillis, max_participants: u64) {
        let organizer = self.organizer();
        let date = self.date();

        // Validate input data
        require!(date < end_date, "The end date cannot be set earlier than the current date");
        require!(max_participants > 0, "The participant limit must be higher than zero");
        require!(max_participants < 10000, "The hard participant limit is 9999");

        // Check if this address has already an active event
        if self.has_active_event(&organizer) {
            let current_id = self.get_active_event_id(&organizer);
            let current_event = self.get_event_by_id(current_id);
            let current_is_active = current_event.is_active(date);

            require!(!current_is_active, "The organizer already has an active event");
            self.event_by_organizer(&organizer).clear();
        }
      
        // Mint all the needed SFTs now and create the event struct
        let event_id = self.get_new_event_id();
        let token_nonce = self.mint_sfts(max_participants, &name, event_id);
        let event = Event::new(name, url, date, end_date, max_participants, token_nonce, organizer.clone());

        // Store the event
        self.events(event_id).set(event);
        self.event_by_organizer(&organizer).set(event_id);
    }

    // Claims and transfers a SFT to a recipient address
    #[endpoint(claimEmblem)]
    fn claim_emblem(&self, recipient: ManagedAddress) {
        let organizer = self.organizer();
        let event_id = self.get_active_event_id(&organizer);

        // Validate the organizer and recipient
        require!(self.has_active_event(&organizer), "The address has no active event");
        require!(!self.has_claimed_event(event_id, &recipient), "This recipient already has claimed this event");

        // Check that the event is active and valid
        let mut event = self.get_event_by_id(event_id);
        require!(event.is_not_stopped(), "The event has was stopped");
        require!(event.is_not_expired(self.date()), "The event has expired");
        require!(event.is_not_full(), "The event is full");

        // Transfer the SFT to the recipient and mark as claimed
        self.transfer_sft(&recipient, event.token_nonce);
        self.has_claimed(event_id, &recipient).set(true);
        event.current_participants += 1u64;
        self.events(event_id).set(event);
    }

    // Stops an event early, before it's end_date
    #[endpoint(finalizeEvent)]
    fn finalize_event(&self) {
        let organizer = self.organizer();
        require!(self.has_active_event(&organizer), "The address has no active event");
        self.deactivate_event(&organizer);
    }
}