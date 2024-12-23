// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BillPayment {
    address public owner;

    // Структура счета
    struct Bill {
        int256 id;
        address payable recipient; // Получатель оплаты
        uint256 amount;           // Сумма счета
        bool paid;                // Статус оплаты
    }

    // Маппинг для хранения счетов
    mapping(int256 => Bill) public bills;
    mapping(address => int256[]) public userBillIds; // Маппинг для хранения ID счетов по адресам пользователей
    int256 public nextBillId;

    // События
    event BillCreated(int256 billId, address recipient, uint256 amount);
    event BillPaid(int256 billId, address payer, uint256 amount);
    
    // Конструктор контракта
    constructor() {
        owner = msg.sender;
    }

    // Модификатор для проверки владельца
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Функция создания счета
    function createBill(address payable _recipient, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Recipient address cannot be zero address");

        bills[nextBillId] = Bill({
            id: nextBillId,
            recipient: _recipient,
            amount: _amount,
            paid: false
        });

        // Добавляем ID счета для пользователя
        userBillIds[_recipient].push(nextBillId);

        emit BillCreated(nextBillId, _recipient, _amount);
        nextBillId++;
    }

    // Функция оплаты счета
    function payBill(int256 _billId) external payable {
        Bill storage bill = bills[_billId];

        require(!bill.paid, "Bill already paid");
        require(msg.value == bill.amount, "Incorrect payment amount");

        bill.paid = true;
        bill.recipient.transfer(msg.value);

        emit BillPaid(_billId, msg.sender, msg.value);
    }

    // Функция проверки статуса счета
    function isPaid(int256 _billId) external view returns (bool) {
        return bills[_billId].paid;
    }

    // Функция получения списка ID счетов пользователя
    function getUserBills(address _user) external view returns (int256[] memory) {
        return userBillIds[_user];
    }

    // Функция вывода средств владельцем (для возврата или дополнительных нужд)
    function withdrawFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(_amount);
    }

    // Функция для получения баланса контракта
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
