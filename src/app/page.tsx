"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";

interface FamilyMember {
  name: string;
  relation: string;
}

interface PlayerData {
  name: string;
  number: string;
  favoriteCandy: string;
  outsideActivity: string;
  favoriteMemory: string;
  family: FamilyMember[];
  photo: string | null;
}

const emptyPlayer: PlayerData = {
  name: "",
  number: "",
  favoriteCandy: "",
  outsideActivity: "",
  favoriteMemory: "",
  family: [{ name: "", relation: "" }],
  photo: null,
};

// Card dimensions: 2.5" x 3.5" ratio (5:7) — standard baseball card
const CARD_W = 500;
const CARD_H = 700;

export default function Home() {
  const [player, setPlayer] = useState<PlayerData>(emptyPlayer);
  const [showCard, setShowCard] = useState(false);
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [generating, setGenerating] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof PlayerData, value: string) => {
    setPlayer((prev) => ({ ...prev, [field]: value }));
  };

  const addFamilyMember = () => {
    setPlayer((prev) => ({
      ...prev,
      family: [...prev.family, { name: "", relation: "" }],
    }));
  };

  const removeFamilyMember = (index: number) => {
    setPlayer((prev) => ({
      ...prev,
      family: prev.family.filter((_, i) => i !== index),
    }));
  };

  const updateFamily = (index: number, field: keyof FamilyMember, value: string) => {
    setPlayer((prev) => ({
      ...prev,
      family: prev.family.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPlayer((prev) => ({ ...prev, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const generateCard = () => {
    setShowCard(true);
    setCardSide("front");
  };

  const downloadImage = async (side: "front" | "back") => {
    const ref = side === "front" ? frontRef : backRef;
    if (!ref.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${player.name || "player"}-card-${side}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  const downloadBoth = async () => {
    // Temporarily show front, capture, then back, capture
    setGenerating(true);
    try {
      // We need both refs visible — they're rendered but only one shown
      // Actually both are always in DOM, just one is hidden via display
      // Let's just download whichever is showing, then the other
      for (const side of ["front", "back"] as const) {
        const ref = side === "front" ? frontRef : backRef;
        if (!ref.current) continue;
        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });
        const link = document.createElement("a");
        link.download = `${player.name || "player"}-card-${side}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      setGenerating(false);
    }
  };

  const shareImage = async () => {
    const ref = cardSide === "front" ? frontRef : backRef;
    if (!ref.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${player.name || "player"}-card-${cardSide}.png`, { type: "image/png" });
        if (navigator.share) {
          await navigator.share({ files: [file] }).catch(() => {});
        } else {
          const link = document.createElement("a");
          link.download = file.name;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
        setGenerating(false);
      });
    } catch {
      setGenerating(false);
    }
  };

  const isFormValid = player.name && player.number;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-950 via-red-950 to-gray-950 border-b-4 border-red-600 px-6 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight">Player Cards</h1>
          <p className="text-red-300/70 mt-1">Trading card generator for the team</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {!showCard ? (
          /* ---- FORM ---- */
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Player Photo</h2>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {player.photo ? (
                    <img src={player.photo} alt="Player" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-sm text-center">Tap to upload</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="text-sm text-gray-400">
                  Upload a photo of the player. It&apos;ll be shown on the front of the card.
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Player Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Name *</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Carter Schmeling"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jersey Number *</label>
                  <input
                    type="text"
                    value={player.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Fun Facts</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorite Candy</label>
                  <input
                    type="text"
                    value={player.favoriteCandy}
                    onChange={(e) => updateField("favoriteCandy", e.target.value)}
                    placeholder="e.g. Sour Patch Kids"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">What do you like to do outside of baseball?</label>
                  <input
                    type="text"
                    value={player.outsideActivity}
                    onChange={(e) => updateField("outsideActivity", e.target.value)}
                    placeholder="e.g. Play video games, go fishing"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorite Baseball Memory</label>
                  <textarea
                    value={player.favoriteMemory}
                    onChange={(e) => updateField("favoriteMemory", e.target.value)}
                    placeholder="e.g. Hitting my first home run in the championship game"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Family (including pets!)</h2>
              <div className="space-y-3">
                {player.family.map((member, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamily(i, "name", e.target.value)}
                      placeholder="Name"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={member.relation}
                      onChange={(e) => updateFamily(i, "relation", e.target.value)}
                      placeholder="e.g. Mom, Dog"
                      className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    {player.family.length > 1 && (
                      <button
                        onClick={() => removeFamilyMember(i)}
                        className="text-gray-500 hover:text-red-400 px-2 py-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addFamilyMember}
                  className="text-sm text-red-500 hover:text-red-400 mt-2"
                >
                  + Add family member
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCard}
              disabled={!isFormValid}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl text-lg transition-colors"
            >
              Generate Card
            </button>
          </div>
        ) : (
          /* ---- CARD VIEW ---- */
          <div className="space-y-6">
            <button
              onClick={() => setShowCard(false)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              ← Back to edit
            </button>

            {/* Front/Back toggle */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCardSide("front")}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                  cardSide === "front"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setCardSide("back")}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                  cardSide === "back"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Back
              </button>
            </div>

            {/* Cards container — both always rendered for html2canvas */}
            <div className="flex justify-center">
              {/* ===== FRONT OF CARD ===== */}
              <div
                ref={frontRef}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  display: cardSide === "front" ? "block" : "none",
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                {/* Card border layer */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    border: "8px solid #b91c1c",
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />

                {/* Inner gold border */}
                <div
                  style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: 6,
                    border: "3px solid #d4a843",
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />

                {/* Background — dark with subtle texture */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #1a0a0a 100%)",
                  }}
                />

                {/* Photo area */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    right: 14,
                    height: 460,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "#222",
                  }}
                >
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top center",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #333 0%, #1a1a1a 100%)",
                      }}
                    >
                      <img
                        src="/kc-blaze-logo.jpg"
                        alt="KC Blaze"
                        style={{ width: 200, opacity: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Gradient fade at bottom of photo */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                      background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                    }}
                  />
                </div>

                {/* Team logo badge — top left */}
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    left: 22,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)",
                    border: "2px solid #d4a843",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    zIndex: 5,
                  }}
                >
                  <img
                    src="/kc-blaze-logo.jpg"
                    alt="KC Blaze"
                    style={{ width: 50, height: 50, objectFit: "contain" }}
                  />
                </div>

                {/* Number badge — top right */}
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 22,
                    background: "rgba(185,28,28,0.9)",
                    border: "2px solid #d4a843",
                    borderRadius: 8,
                    padding: "4px 14px",
                    zIndex: 5,
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: 28,
                      fontWeight: 800,
                      fontFamily: "'Arial Black', sans-serif",
                    }}
                  >
                    #{player.number}
                  </span>
                </div>

                {/* Bottom nameplate area */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 220,
                    background: "linear-gradient(180deg, #1a0808 0%, #0d0505 100%)",
                  }}
                >
                  {/* Gold stripe accent */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 14,
                      right: 14,
                      height: 3,
                      background: "linear-gradient(90deg, transparent, #d4a843, transparent)",
                    }}
                  />

                  {/* Player name */}
                  <div
                    style={{
                      paddingTop: 20,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#d4a843",
                        marginBottom: 6,
                      }}
                    >
                      KC Blaze
                    </div>
                    <div
                      style={{
                        fontSize: player.name.length > 18 ? 32 : 40,
                        fontWeight: 800,
                        color: "white",
                        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                        lineHeight: 1.1,
                        padding: "0 20px",
                        fontStyle: "italic",
                      }}
                    >
                      {player.name}
                    </div>
                  </div>

                  {/* Decorative bottom — baseball seam pattern */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #d4a843)" }} />
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#d4a843",
                        fontWeight: 700,
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      Meet the Player
                    </div>
                    <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, #d4a843, transparent)" }} />
                  </div>
                </div>
              </div>

              {/* ===== BACK OF CARD ===== */}
              <div
                ref={backRef}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  display: cardSide === "back" ? "block" : "none",
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Card border layer */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    border: "8px solid #b91c1c",
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />

                {/* Inner gold border */}
                <div
                  style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: 6,
                    border: "3px solid #d4a843",
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />

                {/* Background */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, #f5f0e8 0%, #ede6d8 50%, #e8e0d0 100%)",
                  }}
                />

                {/* Subtle diamond pattern */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.04,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 15px, #b91c1c 15px, #b91c1c 16px), repeating-linear-gradient(-45deg, transparent, transparent 15px, #b91c1c 15px, #b91c1c 16px)",
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 5,
                    padding: "24px 28px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <img
                      src="/kc-blaze-logo.jpg"
                      alt="KC Blaze"
                      style={{ width: 70, height: 70, objectFit: "contain", margin: "0 auto 8px" }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#1a1a1a",
                        fontFamily: "'Georgia', serif",
                        fontStyle: "italic",
                      }}
                    >
                      {player.name}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#b91c1c",
                        marginTop: 2,
                      }}
                    >
                      #{player.number}
                    </div>
                  </div>

                  {/* Gold divider */}
                  <div
                    style={{
                      height: 2,
                      background: "linear-gradient(90deg, transparent, #d4a843, transparent)",
                      marginBottom: 16,
                    }}
                  />

                  {/* Info sections */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    {player.favoriteCandy && (
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#b91c1c",
                            marginBottom: 4,
                          }}
                        >
                          Favorite Candy
                        </div>
                        <div style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.4 }}>
                          {player.favoriteCandy}
                        </div>
                      </div>
                    )}

                    {player.outsideActivity && (
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#b91c1c",
                            marginBottom: 4,
                          }}
                        >
                          Outside of Baseball
                        </div>
                        <div style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.4 }}>
                          {player.outsideActivity}
                        </div>
                      </div>
                    )}

                    {player.favoriteMemory && (
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#b91c1c",
                            marginBottom: 4,
                          }}
                        >
                          Favorite Baseball Memory
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            color: "#1a1a1a",
                            lineHeight: 1.4,
                            fontStyle: "italic",
                          }}
                        >
                          &ldquo;{player.favoriteMemory}&rdquo;
                        </div>
                      </div>
                    )}

                    {player.family.some((m) => m.name) && (
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "#b91c1c",
                            marginBottom: 8,
                          }}
                        >
                          Family
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {player.family
                            .filter((m) => m.name)
                            .map((m, i) => (
                              <span
                                key={i}
                                style={{
                                  background: "#b91c1c",
                                  color: "white",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  padding: "4px 12px",
                                  borderRadius: 20,
                                }}
                              >
                                {m.name}
                                {m.relation && (
                                  <span style={{ opacity: 0.7, marginLeft: 4 }}>
                                    ({m.relation})
                                  </span>
                                )}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom decorative */}
                  <div
                    style={{
                      textAlign: "center",
                      paddingTop: 12,
                      borderTop: "2px solid rgba(212,168,67,0.3)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#999",
                        fontWeight: 700,
                      }}
                    >
                      KC Blaze &bull; 2026 Season
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadImage(cardSide)}
                disabled={generating}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {generating ? "Generating..." : `Download ${cardSide === "front" ? "Front" : "Back"}`}
              </button>
              <button
                onClick={downloadBoth}
                disabled={generating}
                className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors border border-gray-700"
              >
                {generating ? "..." : "Download Both"}
              </button>
              <button
                onClick={shareImage}
                disabled={generating}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 px-5 rounded-xl transition-colors border border-gray-700"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
