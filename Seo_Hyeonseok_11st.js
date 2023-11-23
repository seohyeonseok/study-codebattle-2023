class Seo_Hyeonseok_11st {

    /**
     * 코드는 JAVASCRIPT 로 작성해 주시고, 위의 첫줄과 on...() 메소드의 이름은 변경하지 말아주세요.
     */

    /**
     * 플레이어의 이름 또는 닉네임을 입력해 주세요.
     * 그대로 두면 Player1 또는 Player2로 replace 됩니다.
     * player_name은 printLog 할때 누구의 로그인지를 구분하기 위해 사용할 수 있고,
     * TURN / ROUND / SET(GAME) 현황판에 표시됩니다.
     */
    player_name = "Seo_Hyeonseok_11st";

    /**
     * 게임이 시작되면 호출됩니다.
     * 게임 중에 사용할 변수들의 초기화를 여기서 합니다.
     */
    onGameStart() {
        // printLog(string)는 플레이 영역 하단의 게임 로그 영역에 텍스트를 출력하는 함수입니다.
        printLog(this.player_name+": onGameStart!");
    }

    /**
     * 세트가 시작되면 호출됩니다.
     * 1번의 게임은 최대 19번의 세트를 실행합니다.
     *
     * @param data
     *   data.my_coins: 나의 코인 보유 수량
     */
    onSetStart(data) {
        printLog(
            this.player_name+": onSetStart! my_coins:"+data.my_coins
        );
    }

    /**
     * 라운드가 시작되면 호출됩니다.
     * 한번의 라운드는 한판을 의미하며, 그 한판을 위해 필요한 정보들을 받습니다.
     *
     * @param data
     *   data.my_coins: 나의 코인 보유 수량.
     *   data.op_coins: 상대방의 코인 보유 수량.
     *   data.my_cards: 나의 카드 2장의 번호. [첫번째 번호, 두번째 번호]
     *   data.op_card: 상대방의 카드 1장의 번호.
     *   data.first_turn: 내가 첫 턴인지 여부. true/false
     *   data.remain_round_count:
     *     이번 세트의 남은 라운드 수. 0이면 이번 세트의 마지막 라운드임을 의미하고,
     *     라운드가 끝난 후 남은 코인 수가 많은 플레이어가 세트의 승자가 됩니다.
     */
    my_card_score = -1;
    absWinPercent = 0;
    simWinPercent = 0;
    onRoundStart(data) {
        this.my_card_score = this.getScore(data.my_cards[0], data.my_cards[1]);
        let win_lose_board = new Map();
        win_lose_board.set('WIN', 0);
        win_lose_board.set('LOSE', 0);

        let round_cards = [data.my_cards[0], data.my_cards[1], data.op_card];
        for (let i = 1; i < 21; i++) {
            if (round_cards.indexOf(i) === -1) {
                let op_card_score = this.getScore(data.op_card, i);
                if (this.my_card_score > op_card_score) {
                    win_lose_board.set('WIN', win_lose_board.get('WIN')+1);
                } else if (this.my_card_score < op_card_score) {
                    win_lose_board.set('LOSE', win_lose_board.get('LOSE')+1);
                } else {
                    if (Math.max(data.my_cards[0], data.my_cards[1]) > Math.max(data.op_card, i)) {
                        win_lose_board.set('WIN', win_lose_board.get('WIN')+1);
                    } else {
                        win_lose_board.set('LOSE', win_lose_board.get('LOSE')+1);
                    }
                }
            }
        }

        this.absWinPercent = 100 * win_lose_board.get('WIN') / (win_lose_board.get('WIN') + win_lose_board.get('LOSE'));
        this.simWinPercent = this.getSimulatedResult(data.my_cards[0], data.my_cards[1], data.op_card, round_cards);

        printLog(
            this.player_name+": onRoundStart! " +
            "내 카드:[" + data.my_cards[0] + ","+data.my_cards[1] + "]" +
            ", 상대:[" + data.op_card + "]" +
            ", abs승률:" + win_lose_board.get('WIN') + "/" + win_lose_board.get('LOSE') +
            ", sim승률:" + this.simWinPercent
        )
    }

    getScore(card1, card2) {
        let min = Math.min(card1, card2);
        let max = Math.max(card1, card2);
        let fixedScore = this.getFixedScore(min, max);
        return fixedScore !== -1
               ? fixedScore
               : (min + max) % 10;
    }
    getFixedScore(min, max) {
        for (let i = 0; i < 10; i++) {
            if ((min === 10 - i) && (max === 20 - i)) {
                return 20 - i;
            }
        }

        return -1;
    }

    getSimulatedResult = (myCard1, myCard2, opCard, roundCards) => {
        let simulate_dashboard = new Map();
        simulate_dashboard.set('WIN', 0);
        simulate_dashboard.set('LOSE', 0);
        for (let i = 0; i < 5000; i++) {
            let rand = Math.round(Math.random() * 19) + 1
            if (roundCards.indexOf(rand) === -1) {
                let op_card_score = this.getScore(opCard, rand);
                if (this.my_card_score > op_card_score) {
                    simulate_dashboard.set('WIN', simulate_dashboard.get('WIN')+1);
                } else if (this.my_card_score < op_card_score) {
                    simulate_dashboard.set('LOSE', simulate_dashboard.get('LOSE')+1);
                } else {
                    if (Math.max(myCard1, myCard2) > Math.max(opCard, rand)) {
                        simulate_dashboard.set('WIN', simulate_dashboard.get('WIN')+1);
                    } else {
                        simulate_dashboard.set('LOSE', simulate_dashboard.get('LOSE')+1);
                    }
                }
            }
        }
        return 100 * simulate_dashboard.get('WIN') / (simulate_dashboard.get('WIN') + simulate_dashboard.get('LOSE'))
    }

    /**
     * 턴이 시작되면 호출됩니다.
     * 상대가 베팅한 코인의 수를 보고 내가 얼마를 베팅할 것인지를 정하여 리턴합니다.
     *
     * @param data
     *   data.my_coins: 나의 현재 코인 보유 수량.
     *   data.op_coins: 상대방의 현재 코인 보유 수량.
     *   data.my_bet_coins: 내가 베팅한 코인 수.(내가 아직 베팅하지 않았으면 10)
     *   data.op_bet_coins: 상대가 베팅한 코인 수.(상대가 아직 베팅하지 않았으면 10)
     *
     * @result -1 또는 이번 라운드에 베팅할 코인의 수
     *   data.op_bet_coins 이상 data.my_coins 이하의 수를 리턴할 수 있습니다.
     *   -1 이거나, 위 조건에 맞지 않는 값을 리턴할 경우, 이번 라운드를 포기하게 되고, data.my_bet_coins만큼이 상대에게 넘어갑니다.
     */
    onTurnStart(data) {
        // 아래의 샘플코드는, 가능한 범위 안에서 랜덤하게 베팅할 코인수를 결정하는데,
        // 약 20% 확률로 라운드를 포기하고, 약 30% 확률로 call을 하도록 간단하게 작성되어 있습니다.
        // 더 나은 알고리즘을 작성해 주세요.
        printLog(
            this.player_name+": onTurnStart! "
            +"my_coins: "+data.my_coins+", op_coins: "+data.op_coins
            +", my_bet_coins: "+data.my_bet_coins+", op_bet_coins: "+data.op_bet_coins
        );

        let max = data.my_coins;
        let min = data.op_bet_coins;

        let myBetCoin;
        if (this.absWinPercent >= 93) {
            printLog("All-In : " + data.my_coins);
            myBetCoin = data.my_coins > data.op_coins ? max : min;
        } else if (this.absWinPercent < 65 ) {
            printLog("Run-Out : -1");
            return -1; // 승률 65% 미만은 포기
        } else {
            myBetCoin = this.calcBetMoney(data.my_coins, data.op_coins, data.op_bet_coins, this.simWinPercent) // 레이즈 or 콜
        }

        if (myBetCoin > max) {
            myBetCoin = max;
        } else if (myBetCoin < min) {
            myBetCoin = -1;
        }

        if (myBetCoin > 0.25 * max) {
            myBetCoin = 0.25 * max
        }

        return Math.round(myBetCoin);

    }

    calcBetMoney = (myCoins, opCoins, opBetCoin, winPercent) => {
        let myBetCoin;
        if (winPercent < 90) {
            myBetCoin = opBetCoin;
        } else if (winPercent < 93) {
            let rand = 0.5 * Math.random() + 1;
            myBetCoin = Math.round(rand * opBetCoin * winPercent / 100);
        } else if (winPercent < 96) {
            let rand = 0.7 * Math.random() + 1;
            myBetCoin = Math.round(rand * opBetCoin * winPercent / 100);
        } else {
            let rand = Math.random() + 1;
            myBetCoin = Math.round(rand * opBetCoin * winPercent / 100);
        }

        printLog("승률: " + winPercent + " 배팅: " + (myCoins > opBetCoin ? myCoins : myBetCoin));
        return myCoins > opBetCoin ? myCoins : myBetCoin;
    }

    /**
     * 라운드가 끝나면 호출되며, 라운드의 결과를 받아봅니다.
     * 두 플레이어의 베팅 코인 수가 같아지거나, 한쪽이 베팅을 포기하면, 라운드가 종료되며 누군가는 코인을 획득합니다.
     *
     * @param result
     *   result.win: -1(졌을때) or 0(비겼을때) or 1(이겼을때)
     *   result.my_coins: 나의 코인 보유 수량.
     *   result.op_coins: 상대방의 코인 보유 수량.
     *   result.op_cards: 상대방의 카드 2장의 번호. [첫번째 번호, 두번째 번호(상대 또는 내가 라운드를 포기한 경우는 0)]
     */
    onRoundEnd(result) {
        // printLog(
        //     this.player_name+": onRoundEnd! win:"+result.win
        //     +", my_coins:"+result.my_coins+", op_coins:"+result.op_coins
        //     +", op_cards:["+result.op_cards[0]+","+result.op_cards[1]+"]"
        // );
    }

    /**
     * 세트가 끝나면 호출되며, 세트의 결과를 받아봅니다.
     * 나 또는 상대방의 코인이 모두 소진되거나, 200 라운드가 실행된 경우에, 세트가 끝납니다.
     *
     * @param result
     *   result.win: -1(졌을때) or 0(비겼을때) or 1(이겼을때)
     *   result.my_coins: 나의 코인 보유 수량.
     *   result.op_coins: 상대방의 코인 보유 수량.
     */
    onSetEnd(result) {
        printLog(
            this.player_name+": onSetEnd! win:"+result.win
            +", my_coins:"+result.my_coins+", op_coins:"+result.op_coins + ", my_winRate:" + this.simWinPercent
        );
    }

    /**
     * 게임이 끝나면 호출되며, 게임의 결과를 받아봅니다.
     *
     * @param result
     *   result.win: -1(졌을때) or 0(비겼을때) or 1(이겼을때)
     */
    onGameEnd(result) {
        printLog(this.player_name+": onGameEnd! win:"+result.win);
    }
}
