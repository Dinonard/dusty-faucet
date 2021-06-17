#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

use ink_lang as ink;

#[ink::contract]
pub mod plasm_faucet {
    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::collections::HashMap as StorageHashMap;

    #[ink(storage)]
    pub struct PlasmFaucet {
        amount: u128,
        owner: AccountId,
        cooldown_map: StorageHashMap<AccountId, u64>,
        cooldown: u64,
    }

    // error types
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        TransferFailed,
        InsufficientFunds,
        BelowSupsistenceThreshold,
    }

    impl PlasmFaucet {
        /// Create new instance of this contract.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                // default units are in femto (10 ^-15) PLD
                amount: 50 * 10 ^ 15,
                cooldown_map: StorageHashMap::new(),

                // should wait about 100 blocks for production
                cooldown: 5,
                owner: Self::env().caller(),
            }
        }

        /// Transfers `self.amount` of PLD to caller.
        ///
        /// # Errors
        ///
        /// - Panics if requested transfer exceeds contract balance.
        /// - Panics if requested transfer brings the contract balance
        ///   below the subsistence threshold.
        /// - Panics if transfer fails for any other reason.
        #[ink(message)]
        pub fn drip(&mut self, to: AccountId) {
            //check cooldown
            let now = self.env().block_timestamp();
            let last_request = self.cooldown_map.get(&to);
            match last_request {
                Some(time) => {
                    let elapsed = now - time;
                    if elapsed < self.cooldown {
                        ink_env::debug_println!("time not elapsed yet: {}", elapsed);
                        panic!(
                            "You must wait {} more block timestamps before requesting PLD!",
                            elapsed
                        );
                    }
                }
                None => (),
            }

            ink_env::debug_println!(
                "{:?}",
                &ink_prelude::format!(
                    "timestamp cleared: contract balance: {}",
                    self.env().balance()
                )
            );

            assert!(self.amount <= self.env().balance(), "insufficient funds!");

            match self.env().transfer(to, self.amount) {
                Err(ink_env::Error::BelowSubsistenceThreshold) => {
                    ink_env::debug_println!("subsistence error");
                    panic!(
                        "requested transfer would have brought contract\
                    below subsistence threshold!"
                    );
                }

                Err(_) => {
                    ink_env::debug_println!("unknown error ;(");
                    panic!("transfer failed!");
                }
                Ok(_) => {
                    let now = self.env().block_timestamp();
                    self.cooldown_map.insert(to, now);
                    ink_env::debug_println!("YAY we made it!");
                }
            }
        }

        /// Asserts that the token self.amount sent as payment with this call
        /// is exactly `self.amount`. This method will fail otherwise, and the
        /// transaction would then be reverted.
        ///
        /// # Note
        ///
        /// The method needs to be annotated with `payable`; only then it is
        /// allowed to receive value as part of the call.
        #[ink(message, payable, selector = "0xCAFEBABE")]
        pub fn was_it_amt(&self) {
            let msg =
                ink_prelude::format!("received payment: {}", self.env().transferred_balance());
            ink_env::debug_println!("{:?}", &msg);
            assert!(
                self.env().transferred_balance() == self.amount,
                "payment was not {}",
                self.amount
            )
        }

        /// Panic if a non-owner of this smart contract is calling this function.
        /// Used to check owner restricted functions.
        fn check_owner(&self) {
            if self.env().caller() != self.owner {
                panic!(
                    "Only this owner can execute that function , {:?}",
                    self.owner
                );
            }
        }

        /// Change the amount of PLD to drip. Only owner can call.
        #[ink(message)]
        pub fn change_amount(&mut self, new_amount: u128) {
            self.check_owner();
            self.amount = new_amount;
        }

        /// Change the owner of the smart contract. Only owner can call.
        #[ink(message)]
        pub fn change_owner(&mut self, new_owner: AccountId) {
            self.check_owner();
            self.owner = new_owner;
        }

        /// Change the cooldown of the smart contract. Only owner can call.
        #[ink(message)]
        pub fn change_cooldown(&mut self, cooldown: u64) {
            self.check_owner();
            self.cooldown = cooldown;
        }

        /// Reset the cooldown map of the smart contract. Only owner can call.
        #[ink(message)]
        pub fn reset_cooldown(&mut self) {
            self.check_owner();
            self.cooldown_map = StorageHashMap::new();
        }
    }

    // Unit tests are very long, try to refactor using previous branch main as reference. Look in issues for refactoring errors.

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_env::{call, test};
        use ink_lang as ink;

        #[ink::test]
        #[should_panic]
        fn change_amount_fail() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            set_sender(accounts.eve);
            plasm_faucet.change_amount(123)

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        fn change_amount_success() {
            // given
            let contract_balance = 100;
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
        fn change_owner_success() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // when owner
            set_sender(accounts.alice);
            plasm_faucet.change_owner(accounts.eve);

            // new owner to old owner
            set_sender(accounts.eve);
            plasm_faucet.change_owner(accounts.alice)

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        #[should_panic]
        fn change_owner_fail() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // non owner
            set_sender(accounts.eve);
            plasm_faucet.change_owner(accounts.eve);

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        fn change_cooldown_success() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // owner
            set_sender(accounts.alice);
            plasm_faucet.change_cooldown(123);

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        #[should_panic]
        fn change_cooldown_fail() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // non owner
            set_sender(accounts.eve);
            plasm_faucet.change_cooldown(234);

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        #[should_panic]
        fn reset_cooldown_fail() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            set_sender(accounts.eve);
            plasm_faucet.reset_cooldown();

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        fn reset_cooldown_success() {
            // given
            let contract_balance = 100;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            set_sender(accounts.alice);
            plasm_faucet.drip(accounts.alice);

            // second drip should work after cooldown reset
            plasm_faucet.reset_cooldown();
            plasm_faucet.drip(accounts.alice);

            //should also check amounts here

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        fn transfer_works() {
            let accounts = default_accounts();
            set_sender(accounts.bob);
            let mut plasm_faucet = create_contract(100);

            set_balance(accounts.bob, 0);
            assert_eq!(plasm_faucet.drip(accounts.bob), ());

            assert_eq!(get_balance(accounts.bob), plasm_faucet.amount);
        }

        #[ink::test]
        #[should_panic(expected = "insufficient funds!")]
        fn transfer_fails_insufficient_funds() {
            // given
            let contract_balance = 1;
            let accounts = default_accounts();
            set_sender(accounts.frank);
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            plasm_faucet.drip(accounts.frank);

            // then
            // `plasm_faucet` must already have panicked here
        }

        #[ink::test]
        fn transfer_non_owner_call() {
            // given
            let contract_balance = 1000;
            let accounts = default_accounts();
            set_sender(accounts.alice);
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            set_sender(accounts.django);
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
            let mut data = ink_env::test::CallData::new(ink_env::call::Selector::new([
                0xCA, 0xFE, 0xBA, 0xBE,
            ]));
            data.push_arg(&accounts.eve);
            let mock_transferred_balance = plasm_faucet.amount;

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
            let mut data = ink_env::test::CallData::new(ink_env::call::Selector::new([
                0xCA, 0xFE, 0xBA, 0xBE,
            ]));
            data.push_arg(&accounts.eve);
            let mock_transferred_balance = plasm_faucet.amount - 1;

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
            let callee =
                ink_env::account_id::<ink_env::DefaultEnvironment>().unwrap_or([0x0; 32].into());
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
    }
}
