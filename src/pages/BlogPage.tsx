import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import {
  SEOHead,
  createBreadcrumbStructuredData,
} from "../components/SEOHead";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Autoscroll from "../imports/Autoscroll-36-773";
import bannerWhatsAppTemplates from "figma:asset/6e786519f1a02074688f10047a075179fe5d22fd.png";
import bannerFreeTestimonialMaker from "figma:asset/c48e285d96490118f293fd140db189fa11606777.png";
import bannerWhatsAppVsTraditional from "figma:asset/468211f53d15b02b2f81fae7a6457f49c8dea2fc.png";
import bannerTestimonialImagesVisual from "figma:asset/71ebc89a5ccbdd605658847b25a849ca9cf66712.png";
import bannerWhatsAppTestimonialMarketing from "figma:asset/9e73a9aa6e428b71250552d12fb5e14076bffd00.png";
import bannerTestimonialTemplatesGuide from "figma:asset/0c37c9b27419fbf76034882674660bafe2abece3.png";
import bannerCollectingFeedbackMadeEasy from "figma:asset/fd92a88c210f27124a7093fad45b463ef9cffe96.png";
import bannerClientTestimonialTemplates from "figma:asset/7349c0fea115b00a8eec94ccbc371f3057c32d2c.png";

// Helper function to get banner image for blog posts
const getBannerImage = (id: string) => {
  const bannerImages = {
    "whatsapp-testimonial-templates": bannerWhatsAppTemplates,
    "free-whatsapp-testimonial-maker":
      bannerFreeTestimonialMaker,
    "whatsapp-vs-traditional-reviews":
      bannerWhatsAppVsTraditional,
    "testimonial-images-visual-feedback":
      bannerTestimonialImagesVisual,
    "whatsapp-testimonial-marketing":
      bannerWhatsAppTestimonialMarketing,
    "testimonial-templates-guide":
      bannerTestimonialTemplatesGuide,
    "testimonial-forms-collecting-feedback":
      bannerCollectingFeedbackMadeEasy,
    "client-testimonial-templates-trust":
      bannerClientTestimonialTemplates,
  };
  return bannerImages[id] || null;
};

export function BlogPage() {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: "whatsapp-testimonial-templates",
      title:
        "WhatsApp Testimonial Templates: Ready-to-Use Examples That Convert",
      excerpt:
        "Creating testimonials from scratch can feel overwhelming. Discover battle-tested templates and examples that businesses use to build trust and increase sales.",
      date: "2024-08-31",
      readTime: "7 min read",
      category: "Templates",
      featured: true,
      tags: [
        "whatsapp",
        "testimonials",
        "templates",
        "examples",
      ],
      bannerImage: bannerWhatsAppTemplates,
    },
    {
      id: "whatsapp-vs-traditional-reviews",
      title:
        "WhatsApp vs Traditional Reviews: Why Chat Testimonials Win Every Time",
      excerpt:
        "Traditional reviews are losing their power while WhatsApp testimonials capture attention and drive conversions like never before. Learn why authenticity beats generic reviews.",
      date: "2024-08-31",
      readTime: "6 min read",
      category: "Comparison",
      featured: true,
      tags: [
        "whatsapp",
        "reviews",
        "authenticity",
        "conversions",
      ],
      bannerImage: bannerWhatsAppVsTraditional,
    },
    {
      id: "free-whatsapp-testimonial-maker",
      title:
        "Free WhatsApp Testimonial Maker: Create Professional Screenshots in Minutes",
      excerpt:
        "Creating professional-looking testimonials used to require design skills and expensive software. Discover how to create stunning visual testimonials in minutes—completely free.",
      date: "2024-08-31",
      readTime: "5 min read",
      category: "Tools",
      featured: false,
      tags: [
        "free",
        "testimonial maker",
        "screenshots",
        "tools",
      ],
      bannerImage: bannerFreeTestimonialMaker,
    },
    {
      id: "whatsapp-testimonial-marketing",
      title:
        "WhatsApp Testimonial Marketing: Turn Customer Messages into Sales Magnets",
      excerpt:
        "Smart marketers have discovered a goldmine in WhatsApp conversations. Learn how to transform casual customer messages into conversion-driving marketing assets.",
      date: "2024-08-31",
      readTime: "8 min read",
      category: "Marketing",
      featured: false,
      tags: [
        "marketing",
        "testimonials",
        "social proof",
        "conversions",
      ],
      bannerImage: bannerWhatsAppTestimonialMarketing,
    },
    {
      id: "testimonial-templates-guide",
      title:
        "Testimonial Templates: The Ultimate Guide to Winning More Clients",
      excerpt:
        "Testimonials are the most powerful trust-building tools for any business. Discover pre-designed formats that help you showcase customer feedback professionally.",
      date: "2024-09-07",
      readTime: "5 min read",
      category: "Templates",
      featured: false,
      tags: [
        "testimonial templates",
        "client trust",
        "business growth",
        "credibility",
      ],
      bannerImage: bannerTestimonialTemplatesGuide,
    },
    {
      id: "testimonial-images-visual-feedback",
      title:
        "Testimonial Images: Why Visual Feedback Works Better Than Words Alone",
      excerpt:
        "We live in a visual-first world. Learn why testimonial images grab attention instantly and how to create them easily for maximum impact.",
      date: "2024-09-07",
      readTime: "4 min read",
      category: "Design",
      featured: false,
      tags: [
        "testimonial images",
        "visual marketing",
        "social media",
        "trust factor",
      ],
      bannerImage: bannerTestimonialImagesVisual,
    },
    {
      id: "client-testimonial-templates-trust",
      title:
        "Client Testimonial Templates: Win Trust Before You Even Talk",
      excerpt:
        "Your future clients want to know if you can deliver. Learn how well-designed client testimonial templates can do the job in seconds.",
      date: "2024-09-07",
      readTime: "4 min read",
      category: "Templates",
      featured: false,
      tags: [
        "client testimonials",
        "business trust",
        "conversion optimization",
        "social proof",
      ],
      bannerImage: bannerClientTestimonialTemplates,
    },
    {
      id: "testimonial-forms-collecting-feedback",
      title: "Testimonial Forms: Collecting Feedback Made Easy",
      excerpt:
        "If you're struggling to collect testimonials, the issue might not be your clients—it's your process. Learn how to make feedback collection effortless.",
      date: "2024-09-07",
      readTime: "4 min read",
      category: "Tools",
      featured: false,
      tags: [
        "testimonial forms",
        "feedback collection",
        "client experience",
        "business tools",
      ],
      bannerImage: bannerCollectingFeedbackMadeEasy,
    },
  ];

  const breadcrumbStructuredData =
    createBreadcrumbStructuredData([
      { name: "Home", url: "https://testimonialmaker.in" },
      { name: "Blog", url: "https://testimonialmaker.in/blog" },
    ]);

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "WhatsApp Testimonial Maker Blog",
    description:
      "Expert tips, guides, and best practices for creating authentic testimonials and leveraging social proof for marketing success.",
    url: "https://testimonialmaker.in/blog",
    publisher: {
      "@type": "Organization",
      name: "WhatsApp Testimonial Maker",
      url: "https://testimonialmaker.in",
    },
    blogPost: blogPosts.slice(0, 3).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `https://testimonialmaker.in/blog/${post.id}`,
      datePublished: post.date,
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "WhatsApp Testimonial Maker",
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="Blog - WhatsApp Testimonial Maker | Expert Tips & Guides"
        description="Expert tips, guides, and best practices for creating authentic testimonials and leveraging social proof. Learn from marketing experts and grow your business."
        keywords={[
          "testimonial marketing blog",
          "social proof tips",
          "whatsapp testimonial guide",
          "testimonial best practices",
          "marketing blog",
          "social proof psychology",
          "testimonial design tips",
          "conversion optimization blog",
        ]}
        structuredData={[
          blogStructuredData,
          breadcrumbStructuredData,
        ]}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Testimonial Marketing Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Expert tips, guides, and best practices for
                creating authentic testimonials and leveraging
                social proof to grow your business.
              </p>

              {/* Featured Topics */}
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {[
                  "WhatsApp Testimonials",
                  "Social Proof",
                  "Conversion Tips",
                  "Design Guide",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="pb-16 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full cursor-pointer">
                    {/* Banner Image Preview */}
                    {post.bannerImage && (
                      <div className="overflow-hidden">
                        <img
                          src={post.bannerImage}
                          alt={`${post.title} preview`}
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="pt-3 px-6 pb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                      <h3
                        className={`text-lg font-bold text-gray-900 mb-2 line-clamp-2 ${post.id === "testimonial-images-visual-feedback" ? "font-[Anton]" : ""}`}
                      >
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {post.readTime}
                          </span>
                        </div>
                        <div className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center">
                          Read More
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* CTA to create testimonials */}
            <div className="text-center mt-12">
              <div
                className="rounded-2xl p-8 max-w-2xl mx-auto"
                style={{
                  background:
                    "linear-gradient(to bottom right, #F0FBF6, #EFF8FA)",
                }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Put These Tips into Action?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start creating professional WhatsApp
                  testimonials with our free tool.
                </p>

                {/* Auto-scrolling Testimonial Gallery */}
                <div className="py-6 mb-6">
                  <Autoscroll
                    leftGradient="#F0FBF6"
                    rightGradient="#EFF8FA"
                  />
                </div>

                <div className="px-8">
                  <Link
                    to="/whatsapp-testimonial-maker"
                    className="block"
                  >
                    <div className="w-full bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[56px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]">
                      <div className="flex flex-row items-center justify-center relative size-full">
                        <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                          <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-nowrap">
                            <p className="leading-[normal] whitespace-pre">
                              Start Creating Free
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}