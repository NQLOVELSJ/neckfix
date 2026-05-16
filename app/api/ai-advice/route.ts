import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();

    const {
      forwardHeadAngle = 0,
      headProtrusion = 0,
      shoulderShrug = 0,
      bodyTilt = 0,
      overallScore = 0,
      triggerCount = 0,
    } = body;

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json(
        {
          advice:
            "请在 .env.local 中配置 DEEPSEEK_API_KEY 以启用 AI 建议功能。\n\n基于您当前的检测数据，建议：\n1. 每天坚持做下巴后缩练习 3 组，每组 10 次\n2. 注意坐姿，保持耳垂与肩膀在一条垂直线上\n3. 每工作 30 分钟起身活动颈部",
        },
        { status: 200 }
      );
    }

    const prompt = `你是一位资深的物理治疗师和姿势矫正专家。根据以下用户的姿态检测数据，请给出3-5条简洁实用的个性化纠正建议。使用中文回答，语气温暖而专业，每条建议不超过40个字。

数据（过去60秒内的平均值）：
- 脖子前倾程度: ${forwardHeadAngle}% (分数越高越严重)
- 头部前伸程度: ${headProtrusion}%
- 耸肩程度: ${shoulderShrug}%
- 身体左右倾斜: ${bodyTilt}%
- 综合评分: ${overallScore}/100
- 异常触发次数: ${triggerCount}/60

请以康复治疗师的口吻给出建议，格式为编号列表。`;

    const result = await generateText({
      model: deepseek("deepseek-chat"),
      prompt,
      maxOutputTokens: 500,
      temperature: 0.7,
    });

    return Response.json({ advice: result.text });
  } catch (error: any) {
    console.error("AI advice error:", error);
    return Response.json(
      {
        advice:
          "AI 建议服务暂时不可用。\n\n请继续保持良好的训练习惯：\n1. 下巴后缩练习 3 组，每组 10 次\n2. 注意屏幕高度与眼睛平齐\n3. 定时起身活动颈部肌肉",
      },
      { status: 200 }
    );
  }
}
