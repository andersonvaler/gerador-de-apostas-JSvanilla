(() => {
    let request = new XMLHttpRequest();
    request.open("GET", "./games.json");
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            const games = JSON.parse(request.responseText);
            let app = new App(games.types);
            app.init();
        }
    };

    function App(games) {
        this.init = () => {
            let defaultGame = this.handleGameData("Lotofácil");
            this.setEvents();
            this.renderGame(defaultGame);
            this.renderCart();
        };

        this.selectedNumbers = [];
        this.completedGame = false;
        this.currentGame = {};
        this.cart = [];
        this.msg = {
            completeGame: () => {
                let $container = document.querySelector(".error-cart");
                $container.textContent = `*Complete o jogo!`;
            },

            selectMoreNumbers: (num) => {
                let $container = document.querySelector(".error-complete");
                $container.textContent = `*Selecione ${num} numeros`;
            },
            remove: () => {
                let $number = document.querySelector(".error-complete");
                let $cart = document.querySelector(".error-cart");
                $number.textContent = "";
                $cart.textContent = "";
            },
        };

        this.handleGameData = (name) =>
            games.filter((game) => game.type === name)[0];

        this.setEvents = () => {
            let $betButtons = document.querySelectorAll("#game-button");

            for (let i = 0; i < $betButtons.length; i++) {
                let $current = $betButtons[i];
                let gameData = this.handleGameData($current.className);
                $current.style.color = gameData.color;
                $current.style.borderColor = gameData.color;
                $current.addEventListener(
                    "click",
                    () => {
                        this.setGameButtonsColor($current);
                        this.renderGame(gameData);
                    },
                    false
                );
            }

            let $completeButton = document.querySelector(".complete");
            $completeButton.addEventListener(
                "click",
                () => this.completeGame(this.currentGame),
                false
            );

            let $clearButton = document.querySelector(".clear");
            $clearButton.addEventListener("click", this.clearGame, false);

            let $cartButton = document.querySelector(".add-cart");
            $cartButton.addEventListener("click", this.addToCart, false);
        };

        this.setGameButtonsColor = ($selected) => {
            let $betButtons = document.querySelectorAll("#game-button");

            for (let i = 0; i < $betButtons.length; i++) {
                let $current = $betButtons[i];

                $current.style.color = this.handleGameData(
                    $current.className
                ).color;
                $current.style.borderColor = this.handleGameData(
                    $current.className
                ).color;
                $current.style.backgroundColor = "#fff";
            }

            $selected.style.color = "#fff";
            $selected.style.backgroundColor = this.handleGameData(
                $selected.className
            ).color;
        };

        this.renderGame = (gameData) => {
            this.msg.remove();
            this.currentGame = gameData;
            let $gameName = document.querySelector(".title-game-choose");
            let $gameDescription = document.querySelector(".bet-description");
            let $container = document.querySelector(".bet-numbers");

            $container.innerHTML = "";
            this.selectedNumbers = [];
            $gameName.textContent = `FOR ${gameData.type.toUpperCase()}`;
            $gameDescription.textContent = gameData.description;

            for (let i = 1; i <= gameData.range; i++) {
                let $current = document.createElement("button");
                $current.textContent = i < 10 ? `0${i}` : i;
                $current.className = "number-button";
                $current.addEventListener(
                    "click",
                    () => {
                        let numbers = this.selectedNumbers;
                        let number = $current.textContent;
                        if (
                            numbers.length < gameData["max-number"] &&
                            !numbers.includes(number)
                        ) {
                            this.selectedNumbers.push(number);
                            $current.id = "selected";

                            if (numbers.length == gameData["max-number"]) {
                                this.disableNumbers();
                            }
                        } else {
                            if ($current.id == "selected") {
                                $current.removeAttribute("id");
                                let index =
                                    this.selectedNumbers.indexOf(number);
                                this.selectedNumbers.splice(index, 1);
                                this.activeNumbers();
                            }
                        }
                    },
                    false
                );
                $container.appendChild($current);
            }
        };

        this.addToCart = () => {
            this.msg.remove();
            if (this.completedGame) {
                this.cart.push({
                    name: this.currentGame.type,
                    numbers: this.selectedNumbers,
                    price: this.currentGame.price,
                    color: this.currentGame.color,
                });
                this.clearGame();
                this.renderCart();
                this.completedGame = false;
            } else {
                this.msg.completeGame();
            }
        };

        this.renderCart = () => {
            let $cart = document.querySelector(".cart-itens");
            let $itensCart = document.createElement("div");
            let $cartEmpty = document.createElement("div");

            $cart.innerHTML = "";
            $itensCart.className = "itens-elements";
            $cartEmpty.className = "empty";
            $cartEmpty.textContent = "Carrinho vazio!";

            this.cart.map((item, index) => {
                let $container = document.createElement("div");
                let $deleteContainer = document.createElement("figure");
                let $delete = document.createElement("img");
                let $marker = document.createElement("span");
                let $data = document.createElement("div");
                let $title = document.createElement("h3");
                let $price = document.createElement("section");
                let $numbers = document.createElement("p");

                $container.className = "item";
                $container.id = item.name;

                $delete.setAttribute("src", "./img/lixeira.png");
                $title.textContent = item.name;
                $price.textContent = ` ${item.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                })}`;

                $numbers.textContent = item.numbers.sort();

                $marker.style.backgroundColor = item.color;
                $title.style.color = item.color;

                $delete.addEventListener(
                    "click",
                    () => this.removeFromCart(index),
                    false
                );

                $title.appendChild($price);
                $itensCart.appendChild($container);
                $deleteContainer.appendChild($delete);

                this.addElement($container, [$deleteContainer, $marker, $data]);
                this.addElement($data, [$numbers, $title]);
            });
            $cart.appendChild($itensCart);

            let $total = document.createElement("div");
            $total.className = "total";
            $total.textContent =
                "TOTAL: " +
                this.cart
                    .reduce((acc, current) => current.price + acc, 0)
                    .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    });
            this.cart.length === 0 && $cart.appendChild($cartEmpty);
            this.cart.length > 0 && $cart.appendChild($total);
        };

        this.addElement = (parent, childrens) => {
            childrens.forEach((element) => parent.appendChild(element));
        };

        this.removeFromCart = (index) => {
            this.cart.splice(index, 1);
            this.renderCart();
        };

        this.activeNumbers = () => {
            let $numbersSelected = document.querySelectorAll(".number-button");
            for (let i = 0; i < $numbersSelected.length; i++) {
                $numbersSelected[i].removeAttribute("disabled");
            }
        };

        this.disableNumbers = () => {
            this.msg.remove();
            let $numbersButtons = document.querySelectorAll(".number-button");
            for (let i = 0; i < $numbersButtons.length; i++) {
                if ($numbersButtons[i].id != "selected") {
                    $numbersButtons[i].setAttribute("disabled", true);
                }
            }
        };

        this.completeGame = (game) => {
            this.msg.remove();
            if (this.selectedNumbers.length < game["max-number"]) {
                this.msg.selectMoreNumbers(game["max-number"]);
            } else {
                this.msg.remove();
                this.completedGame = true;
                let $numbersButtons =
                    document.querySelectorAll(".number-button");
                for (let i = 0; i < $numbersButtons.length; i++) {
                    if ($numbersButtons[i].id != "selected") {
                        $numbersButtons[i].style.display = "none";
                    }
                }
            }
        };

        this.clearGame = () => {
            this.msg.remove();
            this.completedGame = false;
            let $numbersSelected = document.querySelectorAll(".number-button");
            this.activeNumbers();
            for (let i = 0; i < $numbersSelected.length; i++) {
                $numbersSelected[i].removeAttribute("id");
                $numbersSelected[i].style.display = "inline";
            }
            this.selectedNumbers = [];
        };
    }
})();
