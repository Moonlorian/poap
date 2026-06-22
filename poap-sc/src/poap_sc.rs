#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;

mod types;
mod storage;
mod endpoints;
mod views;

#[multiversx_sc::contract]
pub trait PoapSc: storage::StorageModule + endpoints::EndpointsModule {
    // Requires ESDTRoleNFTCreate and ESDTRoleNFTBurn on this token
    #[init]
    fn init(&self, token_identifier: TokenIdentifier) {
        self.token_identifier().set(token_identifier);
        self.last_event_id().set(0u64);
    }

    #[upgrade]
    fn upgrade(&self) {}
}