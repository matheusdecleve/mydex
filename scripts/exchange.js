// Importa o Ethers
const ethers = require('ethers');
// Importa o Router da Uniswap
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
// Importa o Artifact DREX
const usdtArtifact = require('../artifacts/contracts/DREX.sol/DREX.json');
// Importa o Artifact ERC20
const wethArtifact = require('../artifacts/contracts/ERC20.sol/REAL.json');
// Inicia o hardhat
const hre = require('hardhat');

// Endereço dos smart contracts
const CONTRACT_ADDRESS = {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
}

// Função para pegar o assinante do contrato
async function getSigner() {
    // Captura a instancia do assinante
    const signer = await hre.ethers.getSigners();
    return signer;
}

// Função para retornar a instancia do contrato
function getContractInstance(address, artifact, signer) {
    return new ethers.Contract(address, artifact.abi, signer)
    // return new ethers.Contract(address, artifact.abi, signer)
}

// Exibir os logs
async function logBalances(provider, signer, contracts) {
    // Capturar os valores
    const {usdt, weth} = contracts;
    // Chama a função getbalances dentro do provider e passa o endereço do assinante, o signatário
    // const ethBalances = await provider.getBalance(signer.address)    
    const ethBalances = await provider.getBalance(signer.address)    
    const usdtBalances = await usdt.balanceOf(signer.address)
    const wethBalances = await weth.balanceOf(signer.address)

    // Exibe a mensagem no console.log
    console.log('*-------------------------------------*');
    console.log('ETH Balance: ', ethers.formatEther(ethBalances));
    console.log('WETH Balance: ', ethers.formatEther(wethBalances));
    console.log('USDT Balance: ', ethers.formatUnits(usdtBalances));
    console.log('*-------------------------------------*');
}

// Executar o SWAP *-----------------*
async function executeSwap(provider, signer, contracts, amountIn) {
    const {usdt, weth, router} = contracts;
    const nonce = await provider.getTransactionCount(signer.address, 'pending');


    await signer.sendTransaction({
        to: CONTRACT_ADDRESS.WETH,
        value: ethers.parseEther('5'),
        nounce: nonce,
    })

    await logBalances(provider, signer, contracts);

    // Aprovar troca de tokens
    const tx1 = await usdt.approve(CONTRACT_ADDRESS.ROUTER, amountIn);
    await tx1.wait();

    /* Função da uniswap para realizar a troca de tokens (swapExactTokensForTokens)
    https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02

    function swapExactTokensForTokens(
        uint amountIn, = Quantidade
        uint amountOutMin, = Quantidade minima de liquidez
        address[] calldata path, = Endereço de contrato
        address to, = signer.address 
        uint deadline = Data de agora + 60 segundos
        ) external returns (uint[] memory amounts);

    */
    const tx2 = await router.swapExactTokensForTokens(
        amountIn,
        0,
        [CONTRACT_ADDRESS.USDT, CONTRACT_ADDRESS.WETH],
        signer.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        { 
            gasLimit: 1000000,
        }
    )

    await tx2.wait();

    await logBalances(provider, signer, contracts);    
}

// Função mãe que chama todas as outras funções
async function main() {
    const signer = await getSigner();
    const provider = hre.ethers.provider;

    const contracts = {
        router: getContractInstance(CONTRACT_ADDRESS.ROUTER, routerArtifact, signer),
        usdt: getContractInstance(CONTRACT_ADDRESS.USDT, usdtArtifact, signer),
        weth: getContractInstance(CONTRACT_ADDRESS.WETH, wethArtifact, signer),
    };

    // 1 Ether
    const amountIn = ethers.parseEther('1');

    await executeSwap(provider, signer, contracts, amountIn);
}

main().catch(e => {
    console.log(e)
    process.exitCode = 1;
})
