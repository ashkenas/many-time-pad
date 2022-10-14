import { useRef, useState } from "react";
import "./EncryptedInput.css";

function EncryptedInput({ setEncrypted, setMessageLength }) {
    const ref = useRef(null);
    const [error, setError] = useState(false);

    const submit = () => {
        if (!ref.current) return;

        const messages = ref.current.value.split('\n').map((m) => m.trim()).filter((m) => m);
        if (messages.length < 2) {
            setError('Must provide at least two messages!');
            return;
        }

        const lengths = messages.map((m) => m.length);
        const allSameLength = lengths.reduce((p, c) => p === c ? c : false, lengths[0]);
        if (!allSameLength) {
            setError('Messages are not all the same length.');
        } else {
            try {
                setEncrypted(messages.map((m) => BigInt(`0x${m}`)));
                setMessageLength(messages[0].length / 2);
            } catch (e) {
                setError('Invalid hexadecimal!');
            }
        }
    };

    return (
        <div className="input-container">
            <h1>Enter All Encrypted Messages</h1>
            <h3>One message per line. Messages should be in hexadecimal format.</h3>
            <textarea ref={ref} rows={15} defaultValue={`000d16251c07044b36171c0307280858291403500a2003450029001e5930070e52
0d0d15713c49000a2c521d120f224f0125004d00163d100011380d0359330a0b4d
151f00221a04064b2d1c0a571a2f021d6a050c145326054505231311102a084701
0d091c71020c4308231c4f1a0f2d0a582c0003501c295624103e0008592a001001
1d480d3e050c43052d521c031b220a163e550e111d6f04001328410e112d1c4701
00000425551e0c1e2e164f150b661e0d2301085016221404003e00090a2d010001
181d063a1c051a4b0d263f5707354f082f070b15103b1a1c523f04190b211b4701
1001013f0149220930131d571d2716583e1d0802166f0104016c005a1a251b0449
19091c3310491a0e365226570a2f0b163e551d110a6f171106290f0e102b014701
030d45221d06160726521d120f2a03016a190403072a18450623413b1b360e1501
1a090d71020c430a30174f13012f011f6a02081c1f6f010c06240e0f0d64070253`}></textarea>
            {error && <h5 style={{color: 'red'}}>{error}</h5>}
            <button onClick={submit}>Begin</button>
        </div>
    )
};

export default EncryptedInput;