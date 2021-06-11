use super::*;
use ink_env::{call, test};

/// Creates a new instance of `PlasmFaucet` with `initial_balance`.
///
/// Returns the `contract_instance`.
fn create_contract(initial_balance: Balance) -> PlasmFaucet {
    let accounts = default_accounts();
    set_sender(accounts.alice);
    set_balance(contract_id(), initial_balance);
    PlasmFaucet::new()
}

fn contract_id() -> AccountId {
    ink_env::test::get_current_contract_account_id::<ink_env::DefaultEnvironment>()
        .expect("Cannot get contract id")
}

fn set_sender(sender: AccountId) {
    let callee = ink_env::account_id::<ink_env::DefaultEnvironment>().unwrap_or([0x0; 32].into());
    test::push_execution_context::<Environment>(
        sender,
        callee,
        1000000,
        1000000,
        test::CallData::new(call::Selector::new([0x00; 4])), // dummy
    );
}

fn default_accounts() -> ink_env::test::DefaultAccounts<ink_env::DefaultEnvironment> {
    ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
        .expect("Off-chain environment should have been initialized already")
}

fn set_balance(account_id: AccountId, balance: Balance) {
    ink_env::test::set_account_balance::<ink_env::DefaultEnvironment>(account_id, balance)
        .expect("Cannot set account balance");
}

fn get_balance(account_id: AccountId) -> Balance {
    ink_env::test::get_account_balance::<ink_env::DefaultEnvironment>(account_id)
        .expect("Cannot set account balance")
}
