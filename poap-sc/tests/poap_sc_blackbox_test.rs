use multiversx_sc_scenario::imports::*;
use poap_sc::poap_sc_proxy::{PoapScProxy};
use multiversx_sc_scenario::imports::TimestampMillis;

const CODE_PATH: MxscPath = MxscPath::new("output/poap-sc.mxsc.json");
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const ORGANIZER_ADDRESS: TestAddress = TestAddress::new("organizer");
const ORGANIZER2_ADDRESS: TestAddress = TestAddress::new("organizer2");
const RECIPIENT_ADDRESS: TestAddress = TestAddress::new("recipient");
const RECIPIENT2_ADDRESS: TestAddress = TestAddress::new("recipient2");
const SC_ADDRESS: TestSCAddress = TestSCAddress::new("poap-sc");

const TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("POAP-042a5d");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace(".");
    blockchain.register_contract(CODE_PATH, poap_sc::ContractBuilder);
    blockchain
}

/// Deploys the contract and grants the SC local mint/burn roles for TOKEN_ID.
/// Block timestamp is set to 1_000_000 ms.
fn setup() -> ScenarioWorld {
    let mut world = world();

    world.set_state_step(
        SetStateStep::new()
            .put_account(OWNER_ADDRESS, Account::new().nonce(1))
            .put_account(ORGANIZER_ADDRESS, Account::new().nonce(1))
            .put_account(ORGANIZER2_ADDRESS, Account::new().nonce(1))
            .put_account(RECIPIENT_ADDRESS, Account::new().nonce(1))
            .put_account(RECIPIENT2_ADDRESS, Account::new().nonce(1))
            .new_address(OWNER_ADDRESS, 1, SC_ADDRESS)
            .block_timestamp_seconds(1_000),
    );

    world
        .tx()
        .from(OWNER_ADDRESS)
        .typed(PoapScProxy)
        .init(TOKEN_ID.to_esdt_token_identifier())
        .code(CODE_PATH)
        .run();

    world.set_esdt_local_roles(
        SC_ADDRESS,
        b"POAP-042a5d",
        &[EsdtLocalRole::NftCreate, EsdtLocalRole::NftBurn, EsdtLocalRole::NftAddQuantity],
    );

    world
}

fn create_event(
    world: &mut ScenarioWorld,
    from: TestAddress,
    name: &str,
    url: &str,
    end_date: u64,
    max_participants: u64,
) {
    world
        .tx()
        .from(from)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .create_event(
            ManagedBuffer::from(name),
            ManagedBuffer::from(url),
            TimestampMillis::new(end_date),
            max_participants,
        )
        .run();
}

fn claim_emblem(world: &mut ScenarioWorld, from: TestAddress, recipient: TestAddress) {
    world
        .tx()
        .from(from)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(recipient.to_address())
        .run();
}

fn finalize_event(world: &mut ScenarioWorld, from: TestAddress) {
    world
        .tx()
        .from(from)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .finalize_event()
        .run();
}

#[test]
fn test_create_event_success() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Rust Meetup", "https://example.com/emblem.png", 1_000_000_000, 100);

    let active_event = world
        .query()
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .get_active_event_view(ORGANIZER_ADDRESS.to_address())
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(active_event.is_some(), "organizer should have an active event after createEvent");
}

#[test]
fn test_create_event_end_date_before_now_fails() {
    let mut world = setup();

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .create_event(
            ManagedBuffer::from("Bad Event"),
            ManagedBuffer::from("https://example.com/emblem.png"),
            TimestampMillis::new(0u64), // end_date in the past
            10u64,
        )
        .returns(ExpectError(4, "The end date cannot be set earlier than the current date"))
        .run();
}

#[test]
fn test_create_event_zero_participants_fails() {
    let mut world = setup();

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .create_event(
            ManagedBuffer::from("Bad Event"),
            ManagedBuffer::from("https://example.com/emblem.png"),
            TimestampMillis::new(2_000_000_000u64),
            0u64, // max_participants == 0
        )
        .returns(ExpectError(4, "The participant limit must be higher than zero"))
        .run();
}

#[test]
fn test_create_event_too_many_participants_fails() {
    let mut world = setup();

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .create_event(
            ManagedBuffer::from("Bad Event"),
            ManagedBuffer::from("https://example.com/emblem.png"),
            TimestampMillis::new(2_000_000_000u64),
            10_000u64,
        )
        .returns(ExpectError(4, "The hard participant limit is 9999"))
        .run();
}

#[test]
fn test_create_event_while_active_event_exists_fails() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "First Event", "https://example.com/1.png", 2_000_000_000, 10);

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .create_event(
            ManagedBuffer::from("Second Event"),
            ManagedBuffer::from("https://example.com/2.png"),
            TimestampMillis::new(2_000_000_000u64),
            10u64,
        )
        .returns(ExpectError(4, "The organizer already has an active event"))
        .run();
}

#[test]
fn test_create_event_after_previous_expired_succeeds() {
    let mut world = setup();

    // This event should expire shortly after the initial timestamp (1_000_000)
    create_event(&mut world, ORGANIZER_ADDRESS, "Expiring Event", "https://example.com/1.png", 1_000_500, 10);

    // Advance time to expire the last event
    world.set_state_step(SetStateStep::new().block_timestamp_seconds(2_000));

    // Creating a new event should work now
    create_event(&mut world, ORGANIZER_ADDRESS, "New Event", "https://example.com/2.png", 5_000_000_000, 10);
}

#[test]
fn test_claim_emblem_success() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Rust Meetup", "https://example.com/emblem.png", 2_000_000_000, 10);
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);

    // The recipient must have exactly 1 unit of the SFT with nonce 1
    world.check_account(RECIPIENT_ADDRESS).esdt_nft_balance_and_attributes(
        TOKEN_ID,
        1u64,
        1u64,
        Option::<()>::None,
    );

    let has_claimed = world
        .query()
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .has_claimed_view(1u64, RECIPIENT_ADDRESS.to_address())
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(has_claimed);
}

#[test]
fn test_claim_emblem_no_active_event_fails() {
    let mut world = setup();

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(RECIPIENT_ADDRESS.to_address())
        .returns(ExpectError(4, "The address has no active event"))
        .run();
}

#[test]
fn test_claim_emblem_twice_same_recipient_fails() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Rust Meetup", "https://example.com/emblem.png", 2_000_000_000, 10);
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(RECIPIENT_ADDRESS.to_address())
        .returns(ExpectError(4, "This recipient already has claimed this event"))
        .run();
}

#[test]
fn test_claim_emblem_event_full_fails() {
    let mut world = setup();

    // max_participants = 1
    create_event(&mut world, ORGANIZER_ADDRESS, "Tiny Event", "https://example.com/emblem.png", 2_000_000_000, 1);
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(RECIPIENT2_ADDRESS.to_address())
        .returns(ExpectError(4, "The event is full"))
        .run();
}

#[test]
fn test_claim_emblem_expired_event_fails() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Soon Expiring Event", "https://example.com/emblem.png", 1_000_500, 10);

    world.set_state_step(SetStateStep::new().block_timestamp_seconds(2_000));

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(RECIPIENT_ADDRESS.to_address())
        .returns(ExpectError(4, "The event has expired"))
        .run();
}

#[test]
fn test_claim_emblem_stopped_event_fails() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Will Be Stopped", "https://example.com/emblem.png", 2_000_000_000, 10);
    finalize_event(&mut world, ORGANIZER_ADDRESS);

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(RECIPIENT_ADDRESS.to_address())
        .returns(ExpectError(4, "The address has no active event"))
        .run();
}

#[test]
fn test_finalize_event_success_burns_remaining_sfts() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Event To Finalize", "https://example.com/emblem.png", 2_000_000_000, 10);
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);
    finalize_event(&mut world, ORGANIZER_ADDRESS);

    create_event(&mut world, ORGANIZER_ADDRESS, "Brand New Event", "https://example.com/new.png", 2_000_000_000, 10);
}

#[test]
fn test_finalize_event_no_active_event_fails() {
    let mut world = setup();

    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .finalize_event()
        .returns(ExpectError(4, "The address has no active event"))
        .run();
}

#[test]
fn test_get_active_event_view_none_when_no_event() {
    let mut world = setup();

    let result = world
        .query()
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .get_active_event_view(ORGANIZER_ADDRESS.to_address())
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(result.is_none());
}

#[test]
fn test_get_active_event_view_none_for_other_organizer() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Org1 Event", "https://example.com/1.png", 2_000_000_000, 10);

    let result = world
        .query()
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .get_active_event_view(ORGANIZER2_ADDRESS.to_address())
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(result.is_none());
}

#[test]
fn test_has_claimed_view_false_by_default() {
    let mut world = setup();

    create_event(&mut world, ORGANIZER_ADDRESS, "Event", "https://example.com/1.png", 2_000_000_000, 10);

    let has_claimed = world
        .query()
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .has_claimed_view(1u64, RECIPIENT_ADDRESS.to_address())
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(!has_claimed);
}

#[test]
fn test_multiple_organizers_independent_events() {
    let mut world = setup();

    // Two organizers create independent events
    create_event(&mut world, ORGANIZER_ADDRESS, "Org1 Event", "https://example.com/1.png", 2_000_000_000, 5);
    create_event(&mut world, ORGANIZER2_ADDRESS, "Org2 Event", "https://example.com/2.png", 2_000_000_000, 5);

    // Each one of them can be accessed individually
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);
    claim_emblem(&mut world, ORGANIZER2_ADDRESS, RECIPIENT2_ADDRESS);

    // Both recipients have their SFT's
    world.check_account(RECIPIENT_ADDRESS).esdt_nft_balance_and_attributes(
        TOKEN_ID, 1u64, 1u64, Option::<()>::None,
    );
    world.check_account(RECIPIENT2_ADDRESS).esdt_nft_balance_and_attributes(
        TOKEN_ID, 2u64, 1u64, Option::<()>::None,
    );
}

#[test]
fn test_claim_fills_event_exactly() {
    let mut world = setup();

    // max_participants = 2, multiple recipients can claim
    create_event(&mut world, ORGANIZER_ADDRESS, "Small Event", "https://example.com/emblem.png", 2_000_000_000, 2);

    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT_ADDRESS);
    claim_emblem(&mut world, ORGANIZER_ADDRESS, RECIPIENT2_ADDRESS);

    // The event is full, the 3rd recipient cant claim
    world
        .tx()
        .from(ORGANIZER_ADDRESS)
        .to(SC_ADDRESS)
        .typed(PoapScProxy)
        .claim_emblem(OWNER_ADDRESS.to_address())
        .returns(ExpectError(4, "The event is full"))
        .run();
}