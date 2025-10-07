use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Program entrypoint
entrypoint!(process_instruction);

/// Cross-chain bridge program for Solana
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Crossbeam Bridge Program");

    let instruction = BridgeInstruction::unpack(instruction_data)?;

    match instruction {
        BridgeInstruction::LockTokens { amount, target_chain } => {
            msg!("Instruction: Lock Tokens");
            lock_tokens(program_id, accounts, amount, target_chain)
        }
        BridgeInstruction::UnlockTokens { amount, source_tx_hash } => {
            msg!("Instruction: Unlock Tokens");
            unlock_tokens(program_id, accounts, amount, source_tx_hash)
        }
    }
}

/// Bridge instruction types
pub enum BridgeInstruction {
    /// Lock tokens for cross-chain transfer
    /// Accounts:
    /// 0. `[signer]` The account locking tokens
    /// 1. `[writable]` The bridge vault account
    /// 2. `[writable]` The user's token account
    LockTokens {
        amount: u64,
        target_chain: String,
    },

    /// Unlock tokens after cross-chain verification
    /// Accounts:
    /// 0. `[signer]` The bridge authority
    /// 1. `[writable]` The bridge vault account
    /// 2. `[writable]` The recipient's token account
    UnlockTokens {
        amount: u64,
        source_tx_hash: [u8; 32],
    },
}

impl BridgeInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        Ok(match tag {
            0 => {
                // LockTokens
                if rest.len() < 8 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let amount = u64::from_le_bytes(rest[0..8].try_into().unwrap());
                let target_chain = String::from_utf8(rest[8..].to_vec())
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
                Self::LockTokens { amount, target_chain }
            }
            1 => {
                // UnlockTokens
                if rest.len() < 40 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let amount = u64::from_le_bytes(rest[0..8].try_into().unwrap());
                let source_tx_hash: [u8; 32] = rest[8..40].try_into().unwrap();
                Self::UnlockTokens { amount, source_tx_hash }
            }
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}

fn lock_tokens(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    target_chain: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_account = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let user_token_account = next_account_info(account_info_iter)?;

    // Verify user is signer
    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Locking {} tokens for target chain: {}", amount, target_chain);
    
    // In a real implementation:
    // 1. Transfer tokens from user to vault
    // 2. Record the lock event
    // 3. Emit cross-chain message

    Ok(())
}

fn unlock_tokens(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    source_tx_hash: [u8; 32],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_account = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let recipient_token_account = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Unlocking {} tokens from tx: {:?}", amount, source_tx_hash);
    
    // In a real implementation:
    // 1. Verify the source transaction hasn't been processed
    // 2. Transfer tokens from vault to recipient
    // 3. Mark transaction as processed

    Ok(())
}
