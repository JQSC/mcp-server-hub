import { HfInference } from "@huggingface/inference";

/**
 * Hugging Face MCP服务工具
 * 用于调用Hugging Face上的模型推理API
 */
export class HuggingFaceMcpTool {
  private hf: HfInference;

  /**
   * 构造函数
   * @param {string} apiKey - Hugging Face API密钥
   */
  constructor(apiKey: string) {
    this.hf = new HfInference(apiKey);
  }

  /**
   * 文本生成
   * @param {string} model - 模型ID，例如 'gpt2'
   * @param {string} inputs - 输入文本
   * @param {Object} options - 生成选项
   * @returns {Promise<any>} 生成结果
   */
  async textGeneration(
    model: string,
    inputs: string,
    options?: any,
  ): Promise<any> {
    return this.hf.textGeneration({
      model,
      inputs,
      ...options,
    });
  }

  /**
   * 文本分类
   * @param {string} model - 模型ID
   * @param {string} inputs - 输入文本
   * @returns {Promise<any>} 分类结果
   */
  async textClassification(model: string, inputs: string): Promise<any> {
    return this.hf.textClassification({
      model,
      inputs,
    });
  }

  /**
   * 问答
   * @param {string} model - 模型ID
   * @param {Object} params - 问答参数
   * @param {string} params.question - 问题
   * @param {string} params.context - 上下文
   * @returns {Promise<any>} 问答结果
   */
  async questionAnswering(
    model: string,
    params: { question: string; context: string },
  ): Promise<any> {
    return this.hf.questionAnswering({
      model,
      inputs: {
        question: params.question,
        context: params.context,
      },
    });
  }

  /**
   * 填充遮罩
   * @param {string} model - 模型ID
   * @param {string} inputs - 带有[MASK]标记的输入文本
   * @returns {Promise<any>} 填充结果
   */
  async fillMask(model: string, inputs: string): Promise<any> {
    return this.hf.fillMask({
      model,
      inputs,
    });
  }

  /**
   * 摘要生成
   * @param {string} model - 模型ID
   * @param {string} inputs - 输入文本
   * @param {Object} options - 摘要选项
   * @returns {Promise<any>} 摘要结果
   */
  async summarization(
    model: string,
    inputs: string,
    options?: any,
  ): Promise<any> {
    return this.hf.summarization({
      model,
      inputs,
      ...options,
    });
  }

  /**
   * 文本翻译
   * @param {string} model - 模型ID
   * @param {string} inputs - 输入文本
   * @returns {Promise<any>} 翻译结果
   */
  async translation(model: string, inputs: string): Promise<any> {
    return this.hf.translation({
      model,
      inputs,
    });
  }

  /**
   * 图像分类
   * @param {string} model - 模型ID
   * @param {Blob|ArrayBuffer} image - 图像数据
   * @returns {Promise<any>} 分类结果
   */
  async imageClassification(
    model: string,
    image: Blob | ArrayBuffer,
  ): Promise<any> {
    return this.hf.imageClassification({
      model,
      data: image,
    });
  }

  /**
   * 图像分割
   * @param {string} model - 模型ID
   * @param {Blob|ArrayBuffer} image - 图像数据
   * @returns {Promise<any>} 分割结果
   */
  async imageSegmentation(
    model: string,
    image: Blob | ArrayBuffer,
  ): Promise<any> {
    return this.hf.imageSegmentation({
      model,
      data: image,
    });
  }

  /**
   * 图像到文本（图像描述）
   * @param {string} model - 模型ID
   * @param {Blob|ArrayBuffer} image - 图像数据
   * @returns {Promise<any>} 描述结果
   */
  async imageToText(model: string, image: Blob | ArrayBuffer): Promise<any> {
    return this.hf.imageToText({
      model,
      data: image,
    });
  }

  /**
   * 零样本图像分类
   * @param {string} model - 模型ID
   * @param {Blob|ArrayBuffer} image - 图像数据
   * @param {string[]} candidateLabels - 候选标签
   * @returns {Promise<any>} 分类结果
   */
  async zeroShotImageClassification(
    model: string,
    image: Blob | ArrayBuffer,
    candidateLabels: string[],
  ): Promise<any> {
    return this.hf.zeroShotImageClassification({
      model,
      inputs: {
        image: image,
      },
      parameters: {
        candidate_labels: candidateLabels,
      },
    });
  }

  /**
   * 零样本文本分类
   * @param {string} model - 模型ID
   * @param {string} inputs - 输入文本
   * @param {string[]} candidateLabels - 候选标签
   * @param {string} [multiLabel=false] - 是否多标签
   * @returns {Promise<any>} 分类结果
   */
  async zeroShotClassification(
    model: string,
    inputs: string,
    candidateLabels: string[],
    multiLabel: boolean = false,
  ): Promise<any> {
    return this.hf.zeroShotClassification({
      model,
      inputs,
      parameters: {
        candidate_labels: candidateLabels,
        multi_label: multiLabel,
      },
    });
  }

  /**
   * 语音识别
   * @param {string} model - 模型ID
   * @param {Blob|ArrayBuffer} audio - 音频数据
   * @returns {Promise<any>} 识别结果
   */
  async automaticSpeechRecognition(
    model: string,
    audio: Blob | ArrayBuffer,
  ): Promise<any> {
    return this.hf.automaticSpeechRecognition({
      model,
      data: audio,
    });
  }
}

/**
 * 创建Hugging Face MCP工具实例
 * @param {string} apiKey - Hugging Face API密钥
 * @returns {HuggingFaceMcpTool} 工具实例
 */
export function createHuggingFaceMcpTool(apiKey: string): HuggingFaceMcpTool {
  return new HuggingFaceMcpTool(apiKey);
}

// 导出默认函数
export default createHuggingFaceMcpTool;
