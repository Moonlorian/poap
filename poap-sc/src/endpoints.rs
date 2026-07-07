use multiversx_sc::imports::*;
use crate::types::{Event};

#[multiversx_sc::module]
pub trait EndpointsModule: crate::storage::StorageModule {
    // Get the current date in milliseconds
    fn date(&self) -> TimestampMillis {
        self.blockchain().get_block_timestamp_millis()
    }

    // The caller always represents the organizer
    fn organizer(&self) -> ManagedAddress {
        self.blockchain().get_caller()
    }

    // Create all the SFT's needed to cover the max amount of participants
    fn mint_sfts(&self, count: u64, name: &ManagedBuffer, url: &ManagedBuffer) -> u64 {
        let mut uris = ManagedVec::new();
        uris.push(url.clone());
        
        self.send().esdt_nft_create(
            &self.token_identifier().get(),
            &BigUint::from(count),
            &name,
            &BigUint::zero(),       // No royalties
            &ManagedBuffer::new(),  // No hash
            &ManagedBuffer::new(),  // No attributes
            &uris,
        )
    }

    // Transfer SFT from the Contract to the Recipient address
    fn transfer_sft(&self, recipient: &ManagedAddress, token_nonce: u64) {
        self.send().direct_esdt(
            recipient,
            &self.token_identifier().get(),
            token_nonce,
            &BigUint::from(1u64),
        );
    }

    // Burn excess SFT's
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

    // Stops the event and burns excess SFT's, no matter if end_date was reached
    fn stop_event(&self, organizer: &ManagedAddress) {
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

            // If the event is not active, run the deactivation procedure
            require!(!current_event.is_active(date), "The organizer already has an active event");
            self.stop_event(&organizer);
        }
      
        // Mint all the needed SFTs now and create the event struct
        let event_id = self.get_new_event_id();
        let token_nonce = self.mint_sfts(max_participants, &name, &url);
        let event = Event::new(event_id, name, url, date, end_date, max_participants, token_nonce, organizer.clone());

        // Store the event
        self.events(event_id).set(event);
        self.event_by_organizer(&organizer).set(event_id);
    }

    // Claims and transfers a SFT to a recipient address
    #[endpoint(claimEmblem)]
    fn claim_emblem(&self, recipient: ManagedAddress) {
        // Check the organizer has no active event
        let organizer = self.organizer();
        require!(self.has_active_event(&organizer), "The address has no active event");
        
        // Check the recipient hasn't claimed the event previously
        let event_id = self.get_active_event_id(&organizer);
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
        self.stop_event(&organizer);
    }
}