#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

use ink_lang as ink;

#[ink::contract]
pub mod plasm_faucet {

    #[ink(storage)]
    pub struct PlasmFaucet {
        AMOUNT: u128,
        owner: AccountId,
    }

    //error types
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
            let AMOUNT: u128 = 50;
            Self {
                AMOUNT,
                owner: Self::env().caller(),
            }
        }

        /// Transfers `self.AMOUNT` of PLD to caller.
        ///
        /// # Errors
        ///
        /// - Panics if requested transfer exceeds contract balance.
        /// - Panics if requested transfer brings the contract balance
        ///   below the subsistence threshold.
        /// - Panics if transfer fails for any other reason.
        #[ink(message)]
        pub fn drip(&mut self, to: AccountId) {
            if self.env().caller() != self.owner {
                panic!("This smart contract can only be called by the account that deployed this code, {:?}", self.owner);
            }

            ink_env::debug_println(&ink_prelude::format!(
                "contract balance: {}",
                self.env().balance()
            ));

            assert!(self.AMOUNT <= self.env().balance(), "insufficient funds!");

            match self.env().transfer(to, self.AMOUNT) {
                Err(ink_env::Error::BelowSubsistenceThreshold) => {
                    panic!(
                        "requested transfer would have brought contract\
                    below subsistence threshold!"
                    )
                }

                Err(_) => panic!("transfer failed!"),
                Ok(_) => {}
            }
        }

        /// Asserts that the token self.amount sent as payment with this call
        /// is exactly `self.AMOUNT`. This method will fail otherwise, and the
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
            ink_env::debug_println(&msg);
            assert!(
                self.env().transferred_balance() == self.AMOUNT,
                "payment was not {}",
                self.AMOUNT
            );
        }
    }
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_env::{call, test};
        use ink_lang as ink;

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
        #[should_panic]
        fn transfer_fails_non_owner_call() {
            // given
            let contract_balance = 1;
            let accounts = default_accounts();
            let mut plasm_faucet = create_contract(contract_balance);

            // when
            set_sender(accounts.alice);
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
            let mut data = ink_env::test::CallData::new(ink_env::call::Selector::new([
                0xCA, 0xFE, 0xBA, 0xBE,
            ]));
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
