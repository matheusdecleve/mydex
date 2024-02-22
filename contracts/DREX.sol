// SPDX-License-Identifier: MIT

//Define a versão do compilador > 0.8.0
pragma solidity ^0.8.0;

// Importa a biblioteca OpenZeppelin / Contracts / ERC20
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Importa a biblioteca OpenZeppelin / Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

// Cria o contrato do tipo ERC20
contract DREX is ERC20, Ownable {
    // Define o nome do token e a sigla
    constructor(address initialOwner) Ownable(initialOwner) ERC20("Real", "BRT") {}
    // Cria a função deposito
    function deposit(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    // Cria a função withdraw
    function withdraw(uint amount) public onlyOwner {
        // Se o saldo for  >= quantidade
        require(balanceOf(msg.sender) >= amount);
        // Queimar
        _burn(msg.sender, amount);
        // Enviar o token para quem está chamando-o
        payable(msg.sender).transfer(amount);
    }
}
