'use strict';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-10-13T17:01:17.194Z',
    '2022-10-15T23:36:17.929Z',
    '2022-10-17T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
//FORMATO DATES
const currentDate = function (date, locale) {
  const calcDayPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); //Dar formato en dias

  const daysPassed = calcDayPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  /*  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; */
  return new Intl.DateTimeFormat(locale).format(date);
};
//FORMATO NUMEROS
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//MOVIMIENTOS
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ''; //textContent = 0;

  //Ordenar los movimientos
  const mov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  mov.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);

    const displayDate = currentDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//BALANCE GENERAL
const dispalyGeneralBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//IN, OUT , INTEREST
const calcSummary = function (acc) {
  const inBalance = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(inBalance, acc.locale, acc.currency);

  const outBalance = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(outBalance),
    acc.locale,
    acc.currency
  );

  const intBalance = acc.movements
    .filter(mov => mov > 0)
    .map(int => (int * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = formatCur(
    intBalance,
    acc.locale,
    acc.currency
  );
};

//CREACION DEL USER NAME
const createUsernames = function (accs) {
  // Recibir las account
  accs.forEach(function (acc) {
    acc.userName = acc.owner // Crear elemento en cada objeto
      .toLocaleLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

//UPDATE UI
const updateUI = function () {
  //Display movements
  displayMovements(currentAccount);

  //Display balance
  dispalyGeneralBalance(currentAccount);

  // Display Summary
  calcSummary(currentAccount);
};

//TIMERS
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}: ${sec}`;

    //When 0 seconds, stop timer and log our user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    //Decrese 1s
    time--;
  };
  //Set time to 5 minutes
  let time = 300;
  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

//EVENT HANDLER
//LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  //username
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  //username
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and messange
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    } `;
    containerApp.style.opacity = 100;

    //Date
    const date = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(date);
  } else containerApp.style.opacity = 0;

  //Clear inputs fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur(); // Quitar el parpadeo del cursor en la casilla del pin

  //Timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  updateUI();
});

//TRANSFERS
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  //Clean inputs fields
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    //transfers
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //Dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //UI
    updateUI();
    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      //Dates
      currentAccount.movementsDates.push(new Date().toISOString());
      //UI
      updateUI();
      inputLoanAmount.value = '';
      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
});

// Cancel Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    //Close
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    accounts.splice(index, 1);
    //Update UI
    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  }
});

//Sort Movements
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/* 
// LECTURES
//Numbers
//Conversion
console.log(Number('23'));
console.log(+'23');

//Parsing
console.log(Number.parseInt(' 2.5rem ')); // Entero
console.log(Number.parseFloat(' 2.5rem ')); // Decimal

//Check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0));

//Cheking if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0)); */
/////////////////////////////////////////////////
/* 
//MATH
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.min(5, 18, 23, 11, 2));

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

//Rounding integrers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

//Rounding decimals
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.7).toFixed(2));
console.log(+(2.756).toFixed(2));
 */
/////////////////////////////////////////////////
/* 
//REMAINDER OPERATOR
console.log(5 % 2); //1
console.log(5 / 2); // 5= 2*2 +1
console.log(8 % 3); //2

console.log(6 % 2); //0 Es par
console.log(7 % 2); //1 Es impar

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
 */
/////////////////////////////////////////////////
/* 
//NUMERIC SEPARATORS

const diameter = 287_460_000_000; //287,460,000,000
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee = 15_00;

const PI = 3.14_15;
console.log(PI);

console.log(Number('230000'));
 */
/////////////////////////////////////////////////
/* 
//BigInt
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(4542643765367456753674567456745675674568456n);
console.log(BigInt(4542643765367456753674567456745675674568456n));

//Operations
console.log(10000n + 10000n);
console.log(34545643563765746574657456756756n * 10000000000n);

const huge = 30734957394572097593475n;
const num = 23;
console.log(huge * BigInt(num));

console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == '20');

//Divisions
console.log(10n / 3n);
console.log(10 / 3);
 */
/////////////////////////////////////////////////
/* //DATES
//Create a date
const now = new Date();
console.log(now);

console.log(new Date(' Oct 31 2022 16:11:32'));
console.log(new Date('December 24, 2012'));

console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 0, 24, 11, 56, 7));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//Working with dates
const future = new Date(2037, 0, 24, 11, 56);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2116428960000));

console.log(Date.now());
future.setFullYear(2040);
console.log(future); */
/////////////////////////////////////////////////
/* 
//Operations with dates

const future = new Date(2037, 0, 24, 11, 56);
console.log(+future);

const dayPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = dayPassed(new Date(2037, 3, 14), new Date(2037, 3, 4, 10, 8));
console.log(days1);
 */
/////////////////////////////////////////////////
/* 
//TIMERS
//SetTimeout

const ingredients = ['olives', 'spinach'];

const pizzaTimer = setTimeout((ing1, ing2) =>
  console.log(
    `Here is your pizza with ${ing1} and ${ing2}`,
    3000,
    ...ingredients
  )
);

//SetInterval
setInterval(function () {
  const now = new Date();
  const hour = now.getHours();
  const min = `${now.getMinutes()}`.padStart(2, '0');
  const sec = `${now.getSeconds()}`.padStart(2, '0');
  console.log(`${hour}:${min}:${sec}`);
}, 1000);
 */
