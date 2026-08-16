import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function isMockMode() {
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  return (
    !baseURL ||
    !apiKey ||
    apiKey.includes("your-actual") ||
    apiKey.includes("xxxx") ||
    baseURL.includes("localhost") ||
    baseURL.includes("127.0.0.1")
  );
}

function getClient(): Anthropic {
  if (client) return client;

  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_ANTHROPIC_BASE_URL and AI_INTEGRATIONS_ANTHROPIC_API_KEY must be set to use the Anthropic AI integration.",
    );
  }

  client = new Anthropic({ apiKey, baseURL });
  return client;
}

function getMockMessagesCreate() {
  return {
    create: async (args: any) => {
      const userMessage = args.messages?.[0]?.content;
      const userText = typeof userMessage === 'string' 
        ? userMessage 
        : Array.isArray(userMessage) 
          ? userMessage.map((m: any) => m.text || '').join(' ')
          : '';
      
      let responseText = '';
      
      if (userText.includes('แนะนำสถาบันนี้') || userText.includes('generate-description') || userText.includes('แนะนำสถาบัน')) {
        const nameEnMatch = userText.match(/- ชื่อ \(EN\):\s*([^\n]+)/);
        const nameEn = nameEnMatch?.[1]?.trim() || 'สถาบัน';
        const nameThMatch = userText.match(/- ชื่อ \(TH\):\s*([^\n]+)/);
        const nameTh = nameThMatch?.[1]?.trim() || nameEn;
        const cityMatch = userText.match(/- เมือง \/ ที่ตั้ง:\s*([^\n,]+)/);
        const city = cityMatch?.[1]?.trim() || 'เซบู';
        
        const descriptionTh = `สถาบัน ${nameTh} (${nameEn}) ตั้งอยู่ในเมือง ${city} ประเทศฟิลิปปินส์ เป็นหนึ่งในสถาบันการศึกษาภาษาอังกฤษชั้นนำที่ได้รับความนิยมสูงสำหรับนักเรียนไทยที่มองหาการพัฒนาภาษาอังกฤษในเวลาอันรวดเร็ว

### จุดเด่นที่สำคัญของสถาบัน
* **ระบบการเรียนที่ได้ผลจริง**: มีสัดส่วนวิชาเรียนตัวต่อตัว (1:1 Class) ค่อนข้างสูง ทำให้นักเรียนสามารถโฟกัสกับจุดบกพร่องและแก้ไขได้อย่างตรงจุด
* **การดูแลแบบครบวงจร**: มีที่พัก หอพักในตัว และบริการอาหารครบทุกมื้อเพื่อความสะดวกปลอดภัย
* **บรรยากาศที่เอื้อต่อการเรียน**: เมือง ${city} เป็นสถานที่ที่เหมาะกับทั้งการทัศนศึกษาและการเรียนรู้ควบคู่กันไป

### คอร์สเรียนและหลักสูตร
ที่นี่เด่นด้านหลักสูตร ESL (English as a Second Language) ตั้งแต่ระดับเริ่มต้นไปจนถึงระดับสูง รวมถึงคอร์สเตรียมสอบระดับสากลอย่าง IELTS และ TOEIC ที่มีสถิติคะแนนสำเร็จของนักเรียนที่ผ่านการเรียนที่นี่สูงมาก`;

        responseText = JSON.stringify({
          descriptionTh: descriptionTh,
          taglineTh: `เรียนภาษาอังกฤษอย่างมั่นใจ พัฒนาการสื่อสารอย่างรวดเร็วกับ ${nameTh}`,
          highlights: [
            `ตั้งอยู่ในเมือง ${city} สะดวกสบาย ปลอดภัย`,
            `คลาสเรียนตัวต่อตัว (1:1) คุณภาพสูง เน้นการพูดและการนำไปใช้จริง`,
            `สิ่งอำนวยความสะดวกครบครัน พร้อมที่พักและอาหารภายในสถาบัน`
          ],
          seoH1Override: `เรียนภาษาอังกฤษที่ ${city} กับสถาบัน ${nameTh}`,
          seoDescription: `เปรียบเทียบข้อมูล คอร์สเรียน หอพัก และค่าใช้จ่ายของสถาบัน ${nameTh} (${nameEn}) สถาบันสอนภาษาอังกฤษชั้นนำในเมือง ${city} ฟิลิปปินส์ ฟรีค่าธรรมเนียมการสมัคร`,
          seoMarketingMeta: `🎓 พัฒนาภาษาอังกฤษแบบก้าวกระโดดที่ฟิลิปปินส์กับ ${nameTh} ${city}! เรียน 1:1 กับเจ้าของภาษา คอร์สเรียนดี สิ่งอำนวยความสะดวกครบ สมัครเรียนวันนี้รับโปรโมชั่นพิเศษ!`
        }, null, 2);
      } else if (userText.includes('สร้าง SEO metadata') || userText.includes('generate-seo') || userText.includes('seoTitle')) {
        const titleMatch = userText.match(/หัวข้อบทความ:\s*"([^"]+)"/);
        const title = titleMatch?.[1]?.trim() || 'เรียนภาษาอังกฤษที่ฟิลิปปินส์';
        
        responseText = JSON.stringify({
          seoTitle: `${title} | Philingo เรียนต่อฟิลิปปินส์`,
          seoDescription: `อ่านบทความเรื่อง ${title} ข้อมูลอัปเดตล่าสุด เคล็ดลับการเรียนภาษา การเลือกโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ โดยผู้เชี่ยวชาญ Philingo`,
          seoKeywords: `เรียนภาษาอังกฤษฟิลิปปินส์, เรียนฟิลิปปินส์, เรียนเซบู, เรียนบาเกียว, คอร์สภาษาอังกฤษ, เคล็ดลับเรียนภาษา, ${title}`,
          seoMarketingMeta: `✈️ อ่านบทความล่าสุด: ${title} อัปเดตข้อมูลดีๆ สำหรับเตรียมตัวเรียนต่อฟิลิปปินส์ให้ได้ผลดีที่สุด!`
        }, null, 2);
      } else if (userText.includes('Extract all promotion/discount rules') || userText.includes('PROMO_VISION_PROMPT')) {
        responseText = JSON.stringify([
          {
            courseIds: [],
            roomIds: [],
            minWeeks: 4,
            discountType: "percent",
            discountValue: 10,
            label: "ส่วนลดโปรโมชั่นพิเศษ 10%",
            promoCode: null,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: null
          }
        ], null, 2);
      } else {
        const titleMatch = userText.match(/หัวข้อบทความ:\s*"([^"]+)"/) || userText.match(/เขียนบทความเรื่อง:\s*"([^"]+)"/) || userText.match(/หัวข้อ:\s*"([^"]+)"/);
        const title = titleMatch?.[1]?.trim() || 'เคล็ดลับการเรียนภาษาอังกฤษที่ฟิลิปปินส์';
        
        responseText = `<h1>${title}</h1>
<p>การเรียนภาษาอังกฤษในต่างประเทศเป็นหนึ่งในก้าวสำคัญของชีวิต และประเทศฟิลิปปินส์ได้ก้าวขึ้นมาเป็นปลายทางหลักอันดับต้นๆ สำหรับผู้ที่ต้องการเรียนรู้และพัฒนาทักษะภาษาอังกฤษได้อย่างรวดเร็วในงบประมาณที่คุ้มค่าสูงสุด</p>

<h2>ทำไมต้องเป็นประเทศฟิลิปปินส์?</h2>
<p>เมื่อเทียบกับประเทศปลายทางอื่นอย่างสหราชอาณาจักรหรือออสเตรเลีย ฟิลิปปินส์มอบรูปแบบการเรียนที่เป็นเอกลักษณ์ด้วยห้องเรียนตัวต่อตัว (1:1 Classes) ซึ่งช่วยให้นักเรียนได้ฝึกทักษะการสนทนาอย่างใกล้ชิดและได้รับการปรับปรุงข้อผิดพลาดทันทีจากอาจารย์ผู้สอน</p>

<h2>เคล็ดลับการเตรียมตัวก่อนเดินทาง</h2>
<p>การปรับพื้นฐานความรู้ไวยากรณ์เบื้องต้นและการฝึกฟังคำสนทนาในชีวิตประจำวันก่อนเดินทางจะช่วยลดความตื่นเต้นและสร้างความมั่นใจในการเข้าสังคมที่สถาบันตั้งแต่วันแรกได้อย่างรวดเร็ว</p>

<h2>สรุป</h2>
<p>การเลือกสถาบันและเมืองที่เหมาะสมกับความต้องการจะช่วยขับเคลื่อนการเรียนรู้ภาษาอังกฤษของคุณให้ประสบความสำเร็จได้อย่างดีที่สุด สำหรับข้อมูลเชิงลึกและคำแนะนำฟรีจากผู้เชี่ยวชาญ สามารถติดต่อทีมงาน Philingo by Thai Study Abroad Consultant ได้ตลอดเวลาครับ</p>

<h2>คำถามที่พบบ่อย (FAQ)</h2>
<p><strong>Q: ระยะเวลาการเรียนที่แนะนำคือเท่าไหร่?</strong><br/>A: แนะนำขั้นต่ำ 4-8 สัปดาห์ขึ้นไปเพื่อให้เห็นผลลัพธ์และความเปลี่ยนแปลงของความคุ้นเคยทางภาษาได้อย่างชัดเจน</p>
<p><strong>Q: จำเป็นต้องมีระดับภาษาอังกฤษสูงก่อนเดินทางหรือไม่?</strong><br/>A: ไม่จำเป็นเลยครับ สถาบันส่วนใหญ่มีหลักสูตรการวัดระดับก่อนเริ่มเรียนเพื่อจัดวางนักเรียนในคลาสเรียนที่เหมาะสมกับความรู้ที่มีอยู่จริง</p>`;
      }
      
      return {
        content: [{ type: 'text', text: responseText }],
        usage: { input_tokens: 100, output_tokens: 200 }
      };
    }
  };
}

/**
 * Lazily-initialized Anthropic client.
 */
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    if (isMockMode()) {
      if (prop === 'messages') {
        return getMockMessagesCreate();
      }
    }
    const c = getClient();
    const value = (c as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(c) : value;
  },
});
