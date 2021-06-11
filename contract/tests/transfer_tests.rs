mod test_utils;

use ink_lang as ink;
use std::thread;
use std::time::Duration;

#[ink::test]
fn transfer_work_cooldown() {
    let accounts = default_accounts();
    set_sender(accounts.eve);
    let mut plasm_faucet = create_contract(100);
    plasm_faucet.cooldown = 1;

    set_balance(accounts.eve, 0);
    assert_eq!(plasm_faucet.drip(accounts.eve), ());
    thread::sleep(Duration::from_secs(2));
    assert_eq!(plasm_faucet.drip(accounts.eve), ());

    assert_eq!(get_balance(accounts.alice), plasm_faucet.AMOUNT * 2);
}

#[ink::test]
#[should_panic]
fn transfer_work_cooldown_fail() {
    let accounts = default_accounts();
    set_sender(accounts.eve);
    let mut plasm_faucet = create_contract(100);
    plasm_faucet.cooldown = 5;

    set_balance(accounts.eve, 0);
    assert_eq!(plasm_faucet.drip(accounts.eve), ());
    thread::sleep(Duration::from_secs(1));
    assert_eq!(plasm_faucet.drip(accounts.eve), ());

    assert_eq!(get_balance(accounts.alice), plasm_faucet.AMOUNT * 2);
}

#[ink::test]
fn transfer_works() {
    let accounts = default_accounts();
    set_sender(accounts.eve);
    let mut plasm_faucet = create_contract(100);

    set_balance(accounts.eve, 0);
    assert_eq!(plasm_faucet.drip(accounts.eve), ());

    assert_eq!(get_balance(accounts.eve), plasm_faucet.AMOUNT);
}

#[ink::test]
#[should_panic(expected = "insufficient funds!")]
fn transfer_fails_insufficient_funds() {
    // given
    let contract_balance = 1;
    let accounts = default_accounts();
    set_sender(accounts.eve);
    let mut plasm_faucet = create_contract(contract_balance);

    // when
    plasm_faucet.drip(accounts.eve);

    // then
    // `plasm_faucet` must already have panicked here
}

#[ink::test]
fn test_transferred_value() {
    // given
    let accounts = default_accounts();
    let plasm_faucet = create_contract(100);

    // when
    set_sender(accounts.eve);
    let mut data =
        ink_env::test::CallData::new(ink_env::call::Selector::new([0xCA, 0xFE, 0xBA, 0xBE]));
    data.push_arg(&accounts.eve);
    let mock_transferred_balance = plasm_faucet.AMOUNT;

    // Push the new execution context which sets Eve as caller and
    // the `mock_transferred_balance` as the value which the contract
    // will see as transferred to it.
    ink_env::test::push_execution_context::<ink_env::DefaultEnvironment>(
        accounts.eve,
        contract_id(),
        1000000,
        mock_transferred_balance,
        data,
    );

    // then
    // there must be no panic
    plasm_faucet.was_it_amt();
}

#[ink::test]
#[should_panic]
fn test_transferred_value_must_fail() {
    // given
    let accounts = default_accounts();
    let plasm_faucet = create_contract(100);

    // when
    set_sender(accounts.eve);
    let mut data =
        ink_env::test::CallData::new(ink_env::call::Selector::new([0xCA, 0xFE, 0xBA, 0xBE]));
    data.push_arg(&accounts.eve);
    let mock_transferred_balance = plasm_faucet.AMOUNT - 1;

    // Push the new execution context which sets Eve as caller and
    // the `mock_transferred_balance` as the value which the contract
    // will see as transferred to it.
    ink_env::test::push_execution_context::<ink_env::DefaultEnvironment>(
        accounts.eve,
        contract_id(),
        1000000,
        mock_transferred_balance,
        data,
    );

    // then
    plasm_faucet.was_it_amt();
}
