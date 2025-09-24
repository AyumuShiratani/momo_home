// 桁数に応じてnum-inputを生成する関数
function updateNumInputs(numInputContainer, digit, numInputTemplate) {
    // 現在のnum-inputを全て削除
    numInputContainer.innerHTML = "";

    // 指定された桁数分のnum-inputを生成
    for (let i = 0; i < digit; i++) {
        const input = numInputTemplate.content.firstElementChild.cloneNode(true); // テンプレートをコピー

        // イベントリスナーを追加
        input.addEventListener("input", () => moveToNext(input));

        numInputContainer.appendChild(input);
    }
}

// 入力されたら次の入力欄にフォーカスを移動する関数
function moveToNext(current) {
    if (current.value.length >= 1) { // 入力が1文字以上になったら
        let next = current.nextElementSibling; // 次の要素を取得
        while (next && !next.classList.contains("num-input")) { // 次の要素がnum-input-boxクラスでない場合スキップ
            next = next.nextElementSibling;
        }
        if (next) {
            next.focus(); // 次の<input>にフォーカスを移動
        } else {
            current.blur(); // 次の<input>がない場合フォーカスを外す
        }
    }
}

// 目標値を取得する関数
function getTargetValue(targetInput) {
    const target = parseInt(targetInput.value, 10); // 目標値を整数に変換
    if (isNaN(target)) {
        throw new Error("目標値が無効です。数値を入力してください。");
    }
    return target;
}

// ラジオボタンの選択値を取得する関数
function getSortOption(sortOptions) {
    let selectedValue = null;

    sortOptions.forEach(option => {
        if (option.checked) {
            selectedValue = option.value; // 選択されている値を取得
        }
    });

    return selectedValue;
}

// 入力された数字を取得する関数
function getInputValues() {
    const numInputs = document.querySelectorAll(".num-input");
    const values = Array.from(numInputs).map(input => input.value); // 各入力欄の値

    // 空欄があるかチェック
    if (values.some(value => value.trim() === "")) {
        throw new Error("全ての入力欄に数字を入力してください。");
    }

    return values;
}

// 入力された数字リストを使って式を返す関数
function findExpression(inputValues, target, canSort) {
    const ops = ['+', '-', '*', '/'];

    // 安全に式を評価する関数
    function safeEval(expr) {
        try {
            return Function(`"use strict"; return (${expr})`)();
        } catch (e) {
            return null;
        }
    }

    // 全ての式を生成する関数
    function generateAllExpressions(nums) {
        if (nums.length === 1) {
            return [nums[0]];
        } else {
            const expressions = [];
            for (let i = 1; i < nums.length; i++) {
                const leftParts = generateAllExpressions(nums.slice(0, i));
                const rightParts = generateAllExpressions(nums.slice(i));
                for (const left of leftParts) {
                    for (const right of rightParts) {
                        for (const op of ops) {
                            expressions.push(`(${left} ${op} ${right})`);
                        }
                    }
                }
            }
            return expressions;
        }
    }

    // 数字の順列を生成する関数
    function* permutations(array) {
        if (array.length === 1) {
            yield array;
        } else {
            for (let i = 0; i < array.length; i++) {
                const rest = [...array.slice(0, i), ...array.slice(i + 1)];
                for (const perm of permutations(rest)) {
                    yield [array[i], ...perm];
                }
            }
        }
    }

    // メイン処理
    const inputPermutations = canSort === "あり" ? Array.from(permutations(inputValues)) : [inputValues]; // 並べ替えの有無を切り替え
    for (const perm of inputPermutations) {
        const expressions = generateAllExpressions(perm);
        for (const expr of expressions) {
            if (safeEval(expr) === target) {
                return expr; // 条件を満たす式を返す
            }
        }
    }
    return null; // 条件を満たす式が見つからなかった場合
}

// ページ読み込み時にイベントを設定
document.addEventListener("DOMContentLoaded", () => {
    const digitInput = document.querySelector(".digit-input"); // 桁数
    const targetInput = document.getElementById("target-input"); // 目標値
    const sortOptions = document.querySelectorAll('input[name="sort-option"]'); // 並べ替え
    const numInputContainer = document.querySelector(".num-input‐container"); // 数字入力欄のコンテナ
    const solveButton = document.getElementById("solve-button"); // 計算ボタン
    const resultDiv = document.getElementById("result"); // 結果表示欄
    const numInputTemplate = document.getElementById("num-input-template"); // 数字入力のテンプレート

    // 桁数の入力が変更されたときにnum-inputを更新
    digitInput.addEventListener("input", () => {
        const digit = parseInt(digitInput.value, 10);
        if (!isNaN(digit) && digit > 0) {
            updateNumInputs(numInputContainer, digit, numInputTemplate); // 桁数に応じて更新
        } else {
            numInputContainer.innerHTML = ""; // 無効な値の場合はクリア
        }
    });

    // 初期状態で桁数に応じたnum-inputを生成
    updateNumInputs(numInputContainer, parseInt(digitInput.value, 10), numInputTemplate);


    solveButton.addEventListener("click", () => {
        const inputValues = getInputValues(); // 入力された数字を取得
        const targetValue = getTargetValue(targetInput); // 目標値を取得
        const canSort = getSortOption(sortOptions); // 並べ替えオプションを取得
        console.log(inputValues, targetValue, canSort);

        const expression = findExpression(inputValues, targetValue, canSort);
        if (expression) {
            resultDiv.textContent = `${expression} = ${targetValue}`;
        } else {
            resultDiv.textContent = "解が見つかりませんでした。";
        }
    });
});