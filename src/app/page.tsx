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

export default function Home() {
  const [player, setPlayer] = useState<PlayerData>(emptyPlayer);
  const [showCard, setShowCard] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${player.name || "player"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  const shareImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${player.name || "player"}-card.png`, { type: "image/png" });
        if (navigator.share) {
          await navigator.share({ files: [file] }).catch(() => {});
        } else {
          // Fallback to download
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
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b-4 border-yellow-500 px-6 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight">⚾ Player Cards</h1>
          <p className="text-blue-200 mt-1">Get to know your teammates</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {!showCard ? (
          /* ---- FORM ---- */
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-yellow-500 mb-4">📸 Player Photo</h2>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-yellow-500 transition-colors"
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
                  Upload a photo of the player. It&apos;ll be shown on the card.
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-yellow-500 mb-4">🧢 Player Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Name *</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Carter Schmeling"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jersey Number *</label>
                  <input
                    type="text"
                    value={player.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-yellow-500 mb-4">🍬 Fun Facts</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorite Candy</label>
                  <input
                    type="text"
                    value={player.favoriteCandy}
                    onChange={(e) => updateField("favoriteCandy", e.target.value)}
                    placeholder="e.g. Sour Patch Kids"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">What do you like to do outside of baseball?</label>
                  <input
                    type="text"
                    value={player.outsideActivity}
                    onChange={(e) => updateField("outsideActivity", e.target.value)}
                    placeholder="e.g. Play video games, go fishing"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorite Baseball Memory</label>
                  <textarea
                    value={player.favoriteMemory}
                    onChange={(e) => updateField("favoriteMemory", e.target.value)}
                    placeholder="e.g. Hitting my first home run in the championship game"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-yellow-500 mb-4">👨‍👩‍👧‍👦 Family (including pets!)</h2>
              <div className="space-y-3">
                {player.family.map((member, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamily(i, "name", e.target.value)}
                      placeholder="Name"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                    />
                    <input
                      type="text"
                      value={member.relation}
                      onChange={(e) => updateFamily(i, "relation", e.target.value)}
                      placeholder="e.g. Mom, Dog"
                      className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
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
                  className="text-sm text-yellow-500 hover:text-yellow-400 mt-2"
                >
                  + Add family member
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCard}
              disabled={!isFormValid}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold py-3 rounded-xl text-lg transition-colors"
            >
              Generate Player Card ⚾
            </button>
          </div>
        ) : (
          /* ---- CARD VIEW ---- */
          <div className="space-y-6">
            <button
              onClick={() => setShowCard(false)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              ← Back to edit
            </button>

            {/* The Card */}
            <div
              ref={cardRef}
              className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl"
              style={{ width: "100%", maxWidth: 480 }}
            >
              {/* Baseball stitching decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500" />

              <div className="p-6">
                {/* Header with photo and name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-500 overflow-hidden bg-blue-950 flex-shrink-0 shadow-lg">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">⚾</div>
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-white leading-tight">{player.name}</div>
                    <div className="text-yellow-400 text-xl font-bold mt-1">#{player.number}</div>
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="space-y-3 mb-5">
                  {player.favoriteCandy && (
                    <div className="bg-blue-950/60 rounded-lg px-4 py-3">
                      <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">🍬 Favorite Candy</div>
                      <div className="text-white text-sm">{player.favoriteCandy}</div>
                    </div>
                  )}
                  {player.outsideActivity && (
                    <div className="bg-blue-950/60 rounded-lg px-4 py-3">
                      <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">🎮 Outside of Baseball</div>
                      <div className="text-white text-sm">{player.outsideActivity}</div>
                    </div>
                  )}
                  {player.favoriteMemory && (
                    <div className="bg-blue-950/60 rounded-lg px-4 py-3">
                      <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">⭐ Favorite Baseball Memory</div>
                      <div className="text-white text-sm">{player.favoriteMemory}</div>
                    </div>
                  )}
                </div>

                {/* Family */}
                {player.family.some((m) => m.name) && (
                  <div className="bg-blue-950/60 rounded-lg px-4 py-3">
                    <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">👨‍👩‍👧‍👦 Family</div>
                    <div className="flex flex-wrap gap-2">
                      {player.family
                        .filter((m) => m.name)
                        .map((m, i) => (
                          <span
                            key={i}
                            className="bg-blue-800/80 text-white text-xs px-3 py-1 rounded-full"
                          >
                            {m.name}
                            {m.relation && (
                              <span className="text-blue-300 ml-1">({m.relation})</span>
                            )}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadImage}
                disabled={generating}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition-colors"
              >
                {generating ? "Generating..." : "📥 Download"}
              </button>
              <button
                onClick={shareImage}
                disabled={generating}
                className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {generating ? "..." : "📤 Share"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
