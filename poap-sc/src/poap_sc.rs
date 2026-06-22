#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;

mod types;
mod storage;
mod endpoints;
mod views;
pub mod poap_sc_proxy;

#[multiversx_sc::contract]
pub trait PoapSc: storage::StorageModule + endpoints::EndpointsModule + views::ViewsModule {
    // Requires ESDTRoleNFTCreate and ESDTRoleNFTBurn on this token
    #[init]
    fn init(&self, token_identifier: TokenIdentifier) {
        self.token_identifier().set(token_identifier);
        self.last_event_id().set(0u64);
    }

    #[upgrade]
    fn upgrade(&self) {}
}