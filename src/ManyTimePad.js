import { useEffect, useRef, useState } from "react";
import { change2DIndex, changeIndex, clamp, cToO, decode, encode, isEnglish, oToC, toCells } from "./helpers";
import "./ManyTimePad.css";

function ManyTimePad({ encrypted, messageLength, word }) {
    const [editMode, setEditMode] = useState(true);
    const [focus, setFocus] = useState([0, 0]);
    const [guesses, setGuesses] = useState(Array.from(Array(encrypted.length), () => Array.from(Array(messageLength), () => '')));
    const [openCols, setOpenCols] = useState(Array.from(Array(messageLength), () => [true, 0]));
    const [positions, setPositions] = useState({});
    const focusRef = useRef(null);

    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.setSelectionRange(1, 1);
            focusRef.current.focus();
        }
    }, [focus]);

    useEffect(() => {
        if (word) {
            const newPositions = {};
            const encoded = encode(word); 
            for (let i = 0; i < encrypted.length; i++) {
                for (let k = 0; k <= messageLength - word.length; k++) {
                    let possible = true;
                    for (let j = 0; j < encrypted.length; j++) {
                        if (i === j) continue;

                        const combo = encrypted[i] ^ encrypted[j];
                        const trimmedCombo = (combo >> (8n * BigInt(messageLength - word.length - k))) & ((1n << (8n * BigInt(word.length))) - 1n);
                        possible &&= isEnglish(decode(trimmedCombo ^ encoded));
                    }

                    if(possible) {
                        if (newPositions[i])
                            newPositions[i].push(k);
                        else
                            newPositions[i] = [k];
                    }
                }
            }

            setPositions(newPositions);
        } else {
            setPositions({});
        }
    }, [word, encrypted, messageLength]);

    const handleKeys = (i, j) => (e) => {
        switch (e.keyCode) {
            case 8:  // Backspace
                if (!e.target || e.target.value)
                    break
            case 37: // Left
                e.preventDefault();
                setFocus([i, clamp(j - 1, 0, messageLength - 1)]);
                break;
            case 38: // Up
                setFocus([clamp(i - 1, 0, encrypted.length - 1), j]);
                break;
            case 39: // Right
                setFocus([i, clamp(j + 1, 0, messageLength - 1)]);
                break;
            case 40: // Down
                setFocus([clamp(i + 1, 0, encrypted.length - 1), j]);
                break;
            default:
                break;
        }
    };

    const guess = (i, j) => (e) => {
        const char = e.target.value.substring(e.target.value.length - 1);
        if (char)
            setFocus([i, clamp(j + 1, 0, messageLength)]);
        setGuesses(change2DIndex(guesses, i, j, char));
        setOpenCols(changeIndex(openCols, j, [!char, i]));
    };

    const rows = [];
    const plaintext = [];
    for (let i = 0; i < encrypted.length; i++) {
        const messageChars = [];
        const guessInputs = [];
        let plainMsg = "";
        let message = encrypted[i];

        for (let j = messageLength - 1; j >= 0; j--) {
            const char = message & 255n;
            messageChars.unshift(oToC(char));
            message >>= 8n;

            const disabled = !openCols[j][0] && openCols[j][1] !== i;
            let decrypt;
            if (disabled) {
                const keyChar = cToO(guesses[openCols[j][1]][j]) ^ ((encrypted[openCols[j][1]] >> (8n * BigInt(messageLength - 1 - j))) & 255n);
                decrypt = keyChar ^ char;
            }
            const value = disabled ? oToC(decrypt) : guesses[i][j];
            plainMsg = (value ? value : oToC(char)) + plainMsg;
            const focused = i === focus[0] && j === focus[1];
            const style = positions[i] && positions[i].includes(j) ? { borderColor: 'green' } : {};
            guessInputs.unshift(
                <input type="text" ref={focused ? focusRef : undefined} onChange={guess(i, j)}
                       onKeyDown={handleKeys(i, j)} value={value} disabled={disabled} style={style} />
            );
        }

        rows.push(<tr key={i}>{toCells(messageChars)}</tr>);
        rows.push(<tr key={i + messageLength}>{toCells(guessInputs)}</tr>);
        plaintext.push(<p key={i}>{plainMsg}</p>);
    }

    return (
        <>
            {editMode ? (
                <table>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            ) : (
                <code>
                    {plaintext}
                </code>
            )}
            <div class="mtp-buttons">
                <button onClick={() => setEditMode(!editMode)}>{editMode ? 'View' : 'Edit'}</button>
            </div>
        </>
    );
}

export default ManyTimePad;