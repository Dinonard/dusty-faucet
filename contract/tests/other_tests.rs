mod test_utils;

use ink_lang as ink;

#[ink::test]
#[should_panic]
fn change_amount_fail() {
    // given
    let contract_balance = 1;
    let accounts = default_accounts();
    set_sender(accounts.alice);
    let mut plasm_faucet = create_contract(contract_balance);

    // when
    set_sender(accounts.alice);
    plasm_faucet.change_amount(123)

    // then
    // `plasm_faucet` must already have panicked here
}

#[ink::test]
#[should_panic]
fn change_amount_fail() {
    // given
    let contract_balance = 1;
    let accounts = default_accounts();
    set_sender(accounts.alice);
    let mut plasm_faucet = create_contract(contract_balance);

    // when
    set_sender(accounts.alice);
    plasm_faucet.change_amount(123)

    // then
    // `plasm_faucet` must already have panicked here
}
