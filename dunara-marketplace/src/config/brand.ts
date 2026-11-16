export const brand = {
  name: "Dúnarà Marketplace",
  shortName: "Dúnarà",
  description:
    "Discover skilled professionals and trusted businesses. Connect, compare and get the service you need.",
  owner: "Lumeriq Designs",
  attribution: "Designed & Developed by Lumeriq Designs",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  colors: {
    primary: "#087F50",
    accent: "#B7EF45",
    background: "#F7FAF6",
    foreground: "#17251D"
  }
} as const;
