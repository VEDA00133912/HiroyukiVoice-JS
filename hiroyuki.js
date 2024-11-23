const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SAVE_DIR = path.join(__dirname, 'audio_files');

if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
}

rl.question("喋らせるテキストを入力してください: ", async (text) => {
    if (!text.trim()) {
        console.error(`${COLORS.red}✗ テキストが空です。再度試してください。${COLORS.reset}`);
        rl.close();
        return;
    }

    const url = "https://plbwpbyme3.execute-api.ap-northeast-1.amazonaws.com/production/coefonts/19d55439-312d-4a1d-a27b-28f0f31bedc5/try";

    try {
        const response = await axios.post(url, { text });

        if (response.status === 200) {
            const audioUrl = response.data.location;

            if (audioUrl) {
                try {
                    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });

                    if (audioResponse.status === 200) {
                        const timestamp = Math.floor(Date.now() / 1000);
                        const audioFileName = `hitoyuki_audio_${timestamp}.wav`;
                        const audioFilePath = path.join(SAVE_DIR, audioFileName);

                        fs.writeFileSync(audioFilePath, audioResponse.data);

                        console.log(`${COLORS.green}✓ 音声ファイルが正常に保存されました: ${audioFilePath}${COLORS.reset}`);
                    } else {
                        console.error(`${COLORS.red}✗ 音声のダウンロードに失敗: ${audioResponse.status}${COLORS.reset}`);
                    }
                } catch (error) {
                    console.error(`${COLORS.red}✗ 音声のダウンロード中にエラーが発生しました: ${error.message}${COLORS.reset}`);
                }
            } else {
                console.error(`${COLORS.red}✗ 音声URLが取得できませんでした${COLORS.reset}`);
            }
        } else {
            console.error(`${COLORS.red}✗ リクエスト失敗: Status[${response.status}] サーバーが混雑しているかNGワードが含まれています${COLORS.reset}`);
        }
    } catch (error) {
        if (error.response) {
            console.error(`${COLORS.red}✗ リクエスト失敗: Status[${error.response.status}] サーバーが混雑しているかNGワードが含まれています${COLORS.reset}`);
        } else {
            console.error(`${COLORS.red}✗ リクエスト中にエラーが発生しました: ${error.message}${COLORS.reset}`);
        }
    } finally {
        rl.close();
    }
});
