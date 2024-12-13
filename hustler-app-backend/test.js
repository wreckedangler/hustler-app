require('dotenv').config();
const { getWalletBalance, getTokenBalance } = require('./wallet');

(async () => {
    try {
        const walletAddress = '0xd26C556b899F90397692B227d31944261B4Ed346';
        // const usdtAddress = '0xe96aBAE5e951cE974DdC82429459ef5Cbd26E81A'; // USDT Mainnet Contract Address

        console.log('💸 Getting ETH balance...');
        const ethBalance = await getWalletBalance(walletAddress);
        console.log('ETH Balance:', ethBalance);

        // console.log('💸 Getting USDT balance...');
        // const usdtBalance = await getTokenBalance(walletAddress, usdtAddress);
        // console.log('USDT Balance:', usdtBalance);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
