const { createPotWallet, setActivePotWallet } = require('./potWallet');
const inquirer = require('inquirer');



const createPotFromCLI = async () => {
    try {
        console.log('🚀 Starting Pot Creation...');

        // 🟢 Fragt nach Informationen über den Pot
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'potName',
                message: 'Please enter the name of the Pot (e.g., Main Pot):',
                validate: (input) => input ? true : 'Pot name cannot be empty'
            },
            {
                type: 'confirm',
                name: 'setActive',
                message: 'Do you want to set this Pot as the active Pot?',
                default: true
            }
        ]);

        // 🟢 Pot-Wallet erstellen
        const potWallet = await createPotWallet();
        if (!potWallet) throw new Error('Failed to create pot wallet');

        console.log(`🎉 Pot wallet created successfully!`);
        console.log(`Wallet Address: ${potWallet.wallet_address}`);

        if (answers.setActive) {
            await setActivePotWallet(potWallet.wallet_address);
            console.log(`✅ Pot wallet is now set as the active pot`);
        }

        console.log('🎉 Pot creation completed successfully!');
        console.log('Pot Details:');
        console.log({
            potName: answers.potName,
            initialAmount: parseFloat(answers.initialAmount),
            walletAddress: potWallet.wallet_address
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating pot:', error.message);
        process.exit(1);
    }
};

createPotFromCLI();
