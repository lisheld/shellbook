export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-valentine-red mb-4">
          ShellBook
          </h1>
        </div>

        <div className="prose max-w-none space-y-6 text-gray-700">

          <div className="border-t border-gray-200 my-8" />

          <div className="space-y-4">
            <p>
              Michelle,
            </p>

            <p>
              Hey! Happy valentines day (or whenever you're reading this). I miss you so much and wish we could see each other in person (but hopefully this is acceptable). Honestly long distance isn't too hard, and I think I've actually learned alot about myself with all my newfound free time and I hope I can carry these things over into our relationship. Hopefully you feel the same way, and I hope that you're having a good time away from MIT. As always, I'm so incredibly grateful for you and everything you do, and out of fear of being called corny, I'll just say that I love you so so very much 😄
            </p>

            <p>
              Initially, I thought I'd make an interactive photo album type of website for us, but the more I thought about it, I wanted something that would serve us better during long distance. You know I've been trying to take more pictures to remember the things I do more and also so you can see what I'm doing. So, I made this website, which lets us share pictures of what we're doing with captions and sorts it by day (so it's kind of like an instagram feed) and then the other person can read through it. I hope you like it!
            </p>

            <p className="pt-4">
              Forever,<br />
              Liam
            </p>
          </div>

          <div className="border-t border-gray-200 my-8" />

          <div className="text-center text-sm text-gray-500">
            <p>Created with ❤️ for Valentine's Day 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
