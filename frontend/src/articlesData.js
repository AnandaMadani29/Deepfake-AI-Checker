/**
 * Articles Data - Information and Guidance about Deepfake Detection
 */

export const articles = [
  {
    id: 1,
    category: "Guidance",
    title: "How to Detect Deepfake Images: A Complete Guide",
    excerpt: "Learn the essential techniques and tools to identify AI-generated or manipulated images in the digital age.",
    date: "Mar 10, 2026",
    readTime: "5 min read",
    author: "Fact.it Team",
    image: "/articles/deepfake-guide.jpg",
    content: `
# How to Detect Deepfake Images: A Complete Guide

Deepfake technology has become increasingly sophisticated, making it harder to distinguish real images from AI-generated or manipulated ones. This comprehensive guide will help you understand and identify deepfakes.

## What Are Deepfakes?

Deepfakes are synthetic media created using artificial intelligence and deep learning techniques. They can convincingly swap faces, alter expressions, or create entirely fabricated images that appear authentic.

## Key Indicators of Deepfake Images

### 1. Facial Inconsistencies
- **Unnatural skin texture**: Look for overly smooth or plastic-like skin
- **Inconsistent lighting**: Shadows and highlights that don't match the environment
- **Asymmetrical features**: Slight misalignments in facial features

### 2. Edge Artifacts
- **Blurry boundaries**: Check the edges where the face meets hair or background
- **Color bleeding**: Unusual color transitions at face boundaries
- **Resolution mismatches**: Different quality levels within the same image

### 3. Lighting and Shadows
- **Inconsistent light sources**: Shadows pointing in different directions
- **Unnatural reflections**: Missing or incorrect reflections in eyes
- **Flat lighting**: Lack of natural depth and dimension

### 4. Background Anomalies
- **Warped backgrounds**: Distortions around the subject
- **Inconsistent focus**: Unnatural depth of field
- **Repeated patterns**: AI-generated backgrounds often show repetitive elements

## Using AI Detection Tools

Modern AI detection tools like Fact.it use deep learning models trained on millions of images to identify subtle patterns invisible to the human eye.

### How It Works:
1. **Upload your image** to the detection platform
2. **AI analysis** examines facial features, textures, and artifacts
3. **Confidence score** indicates likelihood of manipulation
4. **Detailed report** explains detected patterns

## Best Practices

✅ **Always verify sources** - Check the origin of suspicious images
✅ **Use multiple tools** - Cross-reference results from different detectors
✅ **Stay updated** - Deepfake technology evolves rapidly
✅ **Trust but verify** - Even authentic-looking images should be questioned

## When to Be Extra Cautious

- Political or controversial content
- Celebrity images from unofficial sources
- Images used to support extraordinary claims
- Content that seems too perfect or staged

## Conclusion

While deepfake detection requires vigilance, combining human observation with AI-powered tools provides the best defense against digital deception. Stay informed, stay skeptical, and always verify before sharing.
    `,
    relatedArticles: [2, 3, 4]
  },
  {
    id: 2,
    category: "News",
    title: "The Rise of AI-Generated Content: What You Need to Know",
    excerpt: "Understanding the implications of AI-generated images and videos in today's digital landscape.",
    date: "Mar 8, 2026",
    readTime: "4 min read",
    author: "Fact.it Team",
    image: "/articles/ai-content.jpg",
    content: `
# The Rise of AI-Generated Content: What You Need to Know

Artificial intelligence has revolutionized content creation, but with great power comes great responsibility. Here's what you need to understand about AI-generated media.

## The Current State of AI Content

AI tools can now generate:
- Photorealistic images
- Convincing videos
- Synthetic voices
- Realistic text content

## Impact on Society

### Positive Applications
- Creative industries and art
- Entertainment and gaming
- Education and training
- Medical simulations

### Potential Risks
- Misinformation spread
- Identity theft
- Fraud and scams
- Privacy violations

## Staying Protected

Learn to identify AI-generated content and use verification tools to protect yourself and others from potential harm.
    `,
    relatedArticles: [1, 5, 6]
  },
  {
    id: 3,
    category: "Blog",
    title: "Understanding Deep Learning Models in Deepfake Detection",
    excerpt: "A technical deep-dive into how AI models detect manipulated images with high accuracy.",
    date: "Mar 5, 2026",
    readTime: "6 min read",
    author: "Fact.it Team",
    image: "/articles/deep-learning.jpg",
    content: `
# Understanding Deep Learning Models in Deepfake Detection

Deep learning has become the cornerstone of modern deepfake detection. This article explores the technology behind the detection systems.

## Neural Network Architectures

### Convolutional Neural Networks (CNNs)
CNNs excel at analyzing visual patterns and detecting subtle inconsistencies in images.

### ResNet and DenseNet
These advanced architectures enable deeper analysis and more accurate detection of sophisticated deepfakes.

## Training Process

Models are trained on millions of real and fake images to learn distinguishing patterns:
1. Feature extraction
2. Pattern recognition
3. Classification
4. Confidence scoring

## Accuracy and Limitations

While AI detection is highly accurate, it's not perfect. Understanding limitations helps users make informed decisions.
    `,
    relatedArticles: [1, 4, 7]
  },
  {
    id: 4,
    category: "Guidance",
    title: "Protecting Your Digital Identity from Deepfakes",
    excerpt: "Essential steps to safeguard your images and prevent unauthorized deepfake creation.",
    date: "Mar 3, 2026",
    readTime: "5 min read",
    author: "Fact.it Team",
    image: "/articles/digital-identity.jpg",
    content: `
# Protecting Your Digital Identity from Deepfakes

Your digital identity is valuable. Here's how to protect it from being used in deepfake creation.

## Preventive Measures

### Limit Public Image Availability
- Review social media privacy settings
- Watermark important photos
- Be selective about what you share

### Monitor Your Digital Footprint
- Set up Google Alerts for your name
- Regularly search for your images
- Use reverse image search tools

### Legal Protection
- Understand your rights
- Document your original content
- Know how to report misuse

## What to Do If You're a Victim

1. Document the deepfake
2. Report to platforms
3. Contact authorities if necessary
4. Seek legal advice

## Future-Proofing

Stay informed about new technologies and protection methods as they emerge.
    `,
    relatedArticles: [1, 2, 8]
  },
  {
    id: 5,
    category: "News",
    title: "New Regulations on AI-Generated Content Worldwide",
    excerpt: "How governments are responding to the deepfake challenge with new laws and regulations.",
    date: "Feb 28, 2026",
    readTime: "4 min read",
    author: "Fact.it Team",
    image: "/articles/regulations.jpg",
    content: `
# New Regulations on AI-Generated Content Worldwide

Governments worldwide are implementing new regulations to address deepfake technology and AI-generated content.

## Global Response

### United States
- Federal laws targeting malicious deepfakes
- State-level regulations on political deepfakes
- Platform accountability requirements

### European Union
- AI Act provisions for synthetic media
- Mandatory disclosure requirements
- Consumer protection measures

### Asia-Pacific
- China's deepfake regulations
- Japan's approach to synthetic media
- Australia's online safety framework

## Industry Self-Regulation

Tech companies are also implementing their own policies and detection systems.

## What This Means for Users

Understanding these regulations helps you know your rights and responsibilities.
    `,
    relatedArticles: [2, 4, 6]
  },
  {
    id: 6,
    category: "Blog",
    title: "The Ethics of AI-Generated Images",
    excerpt: "Exploring the moral implications and ethical considerations of deepfake technology.",
    date: "Feb 25, 2026",
    readTime: "5 min read",
    author: "Fact.it Team",
    image: "/articles/ethics.jpg",
    content: `
# The Ethics of AI-Generated Images

The power to create realistic fake images raises important ethical questions that society must address.

## Key Ethical Concerns

### Consent and Autonomy
- Right to control one's image
- Unauthorized use of likeness
- Privacy violations

### Truth and Authenticity
- Erosion of trust in media
- Impact on journalism
- Historical record integrity

### Harm Prevention
- Protecting vulnerable individuals
- Preventing malicious use
- Balancing innovation with safety

## Ethical Frameworks

Different approaches to managing AI-generated content ethically.

## Moving Forward

Building a responsible AI ecosystem requires collaboration between technologists, ethicists, policymakers, and users.
    `,
    relatedArticles: [2, 5, 7]
  },
  {
    id: 7,
    category: "Guidance",
    title: "Best Practices for Content Verification",
    excerpt: "A practical guide to verifying the authenticity of images and videos you encounter online.",
    date: "Feb 20, 2026",
    readTime: "4 min read",
    author: "Fact.it Team",
    image: "/articles/verification.jpg",
    content: `
# Best Practices for Content Verification

In an age of synthetic media, knowing how to verify content is an essential digital literacy skill.

## Verification Checklist

### Source Analysis
- Check the original source
- Verify publisher credibility
- Look for official verification marks

### Technical Analysis
- Use reverse image search
- Check metadata
- Analyze image quality

### Cross-Reference
- Compare with other sources
- Check fact-checking websites
- Consult expert opinions

## Tools and Resources

### Free Verification Tools
- Google Reverse Image Search
- TinEye
- InVID Verification Plugin

### Professional Tools
- Fact.it AI Detection
- Forensic analysis software
- Blockchain verification

## Building Verification Habits

Make verification a routine part of your digital consumption.
    `,
    relatedArticles: [1, 4, 8]
  },
  {
    id: 8,
    category: "Blog",
    title: "The Future of Deepfake Detection Technology",
    excerpt: "What's next for AI-powered detection systems and how they'll evolve to combat new threats.",
    date: "Feb 15, 2026",
    readTime: "5 min read",
    author: "Fact.it Team",
    image: "/articles/future-tech.jpg",
    content: `
# The Future of Deepfake Detection Technology

As deepfake technology advances, detection methods must evolve. Here's what the future holds.

## Emerging Technologies

### Blockchain Verification
- Immutable content authentication
- Chain of custody tracking
- Provenance verification

### Real-Time Detection
- Live video analysis
- Instant verification
- Browser extensions

### Multimodal Analysis
- Combining visual, audio, and metadata
- Contextual understanding
- Behavioral analysis

## Challenges Ahead

### Arms Race Dynamic
- Generators improving constantly
- Detection playing catch-up
- Need for continuous innovation

### Scalability
- Processing billions of images
- Real-time requirements
- Resource constraints

## Collaborative Solutions

The future requires cooperation between:
- Technology companies
- Research institutions
- Government agencies
- Civil society

## Preparing for Tomorrow

Stay informed and support responsible AI development.
    `,
    relatedArticles: [3, 6, 7]
  }
];

export const categories = ["All", "Guidance", "Blog", "News"];

export function getArticleById(id) {
  return articles.find(article => article.id === parseInt(id));
}

export function getArticlesByCategory(category) {
  if (category === "All") return articles;
  return articles.filter(article => article.category === category);
}

export function getRelatedArticles(articleId) {
  const article = getArticleById(articleId);
  if (!article || !article.relatedArticles) return [];
  
  return article.relatedArticles
    .map(id => getArticleById(id))
    .filter(Boolean)
    .slice(0, 3);
}
