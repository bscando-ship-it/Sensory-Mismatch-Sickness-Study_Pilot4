// processor.js
class DAFProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 96000; 
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.delaySamples = 0;

    this.port.onmessage = (e) => {
      this.delaySamples = Math.floor((e.data / 1000) * sampleRate);
    };
  }

  process(inputs, outputs) {
    const input = inputs[0][0];  // 마이크 입력 (보통 1채널)
    const output = outputs[0];     // 스피커 출력 (L, R 채널 포함)

    if (input) {
      for (let i = 0; i < input.length; i++) {
        // 1. 입력 샘플을 버퍼에 기록
        this.buffer[this.writeIndex] = input[i];

        // 2. 지연된 위치 계산
        let readIndex = this.writeIndex - this.delaySamples;
        if (readIndex < 0) readIndex += this.bufferSize;

        const delayedSample = this.buffer[readIndex];

        // 3. 양쪽 채널(L, R)에 동일한 소리를 복사해서 출력
        if (output[0]) output[0][i] = delayedSample; // 왼쪽 귀
        if (output[1]) output[1][i] = delayedSample; // 오른쪽 귀

        // 4. 인덱스 업데이트
        this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      }
    }
    return true;
  }
}

registerProcessor('daf-processor', DAFProcessor);
