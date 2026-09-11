import { useState, useEffect, useRef } from "react";
import ReactAudioPlayer from "react-audio-player";

export default function Input({
  fileInputId,
  replyId,
  replyLevel,
  setReplyId,
  setReplyOpen,
}) {
  const [isHovered, setIsHovered] = useState(false); // Post button hover
  const [hover, setHover] = useState(false); // attach hover
  const [pollHover, setPollHover] = useState(false); // poll hover
  const [pollXHover, setPollXHover] = useState(false);
  const [addChoiceHover, setAddChoiceHover] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [choices, setChoices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [deleteHoverIndex, setDeleteHoverIndex] = useState(null);
  const [pollActive, setPollActive] = useState(false);
  const maxReached = files.length >= 4;
  const canPost =
  subtitle.trim().length > 0 ||
  choices.length > 1 ||
  files.length > 0;

const handlePost = async (isReply) => {
  const hasSubtitle = subtitle.trim().length > 0;
  const hasPoll = choices.length > 0;
  const hasFiles = files.length > 0;
  if (!hasSubtitle && !hasPoll && !hasFiles) return;
    const formData = new FormData();
    formData.append("body", subtitle);

    if (isReply === false) {
      formData.append("replyId", -1);
      formData.append("replyLevel", 0);
    } else {
      formData.append("replyId", replyId);
      formData.append("replyLevel", replyLevel);
    }
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      })
    }

    if (choices && choices.length > 0) {
        choices.forEach((file) => {
        formData.append("poll", file);
      });
    }

    try {
      const res = await fetch("https://messagesapi2-616938642091.europe-west1.run.app/post", {
        method: "POST",
        body: formData
      });

      
      const data = await res.json();

      // clear UI
      setSubtitle("");
      setFiles([]);
      setPreviews([]);
      setPollActive(false);

      setChoices([]);
      setReplyId(0);
      setReplyOpen();

    } catch (err) {
      console.error("Post failed:", err);
    }
  };

const handleFileChange = (e) => {
  const selected = Array.from(e.target.files);
  const remainingSlots = 4 - files.length;
  const limitedSelection = selected.slice(0, remainingSlots);

  setFiles((prev) => [...prev, ...limitedSelection]);

  const newPreviews = limitedSelection.map((file) => ({
    url: URL.createObjectURL(file),
    type: file.type,
    name: file.name,
  }));

  setPreviews((prev) => [...prev, ...newPreviews]);

  e.target.value = "";
};

  const removeFile = (index) => {
    try {
      URL.revokeObjectURL(previews[index].url);
    } catch (err) {}
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openModal = (file) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("audio/"))
      return;
    setModalContent(file);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // TEXTAREA AUTO-GROW
  const textRef = useRef(null);
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = "50px";
      // subtract small padding so initial doesn't jump too big
      textRef.current.style.height = Math.max(50, textRef.current.scrollHeight - 10) + "px";
    }
  }, [subtitle]);

  // ESC closes modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Poll functions
  const addChoice = () => {
    if (choices.length < 4) setChoices((prev) => [...prev, ""]);
  };

  
  const updateChoice = (value, index) => {
    setChoices((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const removePoll = () => {
    setPollActive(false);
    setChoices([]);
  };

  const attachDisabled = maxReached;
  const pollDisabled = pollActive;

  return (
<>
      {/* MODAL */}
      {modalOpen && modalContent && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <p style={{
              position: "fixed",
                top: "3px",
                left: "20px",
                cursor: "default"
            }}>  {modalContent.name}
        </p>
            <button
              onClick={closeModal}
              id="xmark"
              style={{
                position: "fixed",
                top: "12px",
                right: "20px",
                background: "rgba(0,0,0,0)",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
                zIndex: 10000,
              }}
            >
              <i className="fa-solid fa-xmark" style={{ color: "#F2F0EF", fontSize: "1.5rem" }} />
            </button>
{modalContent.type.startsWith("image/") ? (
  <img
    src={modalContent.url}
    alt=""
    style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
  />
) : modalContent.type.startsWith("video/") ? (
  <video
    src={modalContent.url}
    controls
    autoPlay
    style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain", cursor: "default" }}
  />
) : modalContent.type.startsWith("audio/") ? (
  <audio
  src={modalContent.url}
  controls
  autoPlay
  style={{
    width: "366px",        // player width
    margin: "", // center horizontally with top/bottom margin
    display: "block",
    borderRadius: "0px",
  }}
/>
) : null}

          </div>
        </div>
      )}

      {/* MAIN UI */}
      <div className="page"
        style={{
          display: "flex",
          flexDirection: "column",

          color: "#F2F0EF",
          paddingBottom:'20px'
        }}
      >  <div className="input-wrapper">
        {/* TEXT */}
        <textarea
          ref={textRef}
          placeholder="Type here..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={{
            width: "350px",
            padding: "8px",
            marginBottom: "15px",
            border: "none",
            outline: "none",
            backgroundColor: "#404040",
            color: "#F2F0EF",
            resize: "none",
            fontSize: "1rem",
            overflow: "hidden",
            minHeight: "50px",
            fontFamily: "SometypeMono",
          }}
        />
</div><div className="input-wrapper">
        {/* POLL UI */}
        {pollActive && (
          <div
            style={{
              width: "350px",
              backgroundColor: "#404040",
              padding: "12px",
              marginBottom: "15px",
              position: "relative",
            }}
          >
            {/* X BUTTON */}
{/* X BUTTON */}
<button
  onClick={removePoll}
  onMouseEnter={() => setPollXHover(true)}
  onMouseLeave={() => setPollXHover(false)}
  style={{
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(0,0,0,0)",
    border: "none",
    cursor: "pointer",
  }}
>
  <i
    className="fa-solid fa-xmark"
    style={{
      color: pollXHover ? "#d1d1d1ff" : "#F2F0EF",
      fontSize: "1rem",
    }}
  ></i>
</button>


            <h3 style={{ fontFamily: "SometypeMono", fontSize: "1rem", marginBottom: "10px", marginTop: "0px" }}>
              Poll
            </h3>

            {choices.map((choice, index) => (
              <input
                key={index}
                value={choice}
                onChange={(e) => updateChoice(e.target.value, index)}
                placeholder={`Choice ${index + 1}`}
                style={{
                  width: "338px",
                  padding: "6px",
                  marginBottom: "8px",
                  backgroundColor: "#303030",
                  border: "none",
                  outline: "none",
                  color: "#F2F0EF",
                  fontSize: ".9rem",
                  fontFamily: "SometypeMono"
                }}
              />
            ))}

{choices.length < 4 && (
  <button
    onClick={addChoice}
    onMouseEnter={() => setAddChoiceHover(true)}
    onMouseLeave={() => setAddChoiceHover(false)}
    style={{
      background: "none",
      border: "0",
      padding: "5px 8px",
      color: addChoiceHover ? "#d1d1d1ff" : "#F2F0EF",
      cursor: "pointer",
      fontSize: ".9rem",
      fontFamily: "SometypeMono",
    }}
  >
    + Add Choice
  </button>
)}

          </div>
        )}</div>

        {/* PREVIEWS */}
        {previews.length > 0 && (
          <div style={{ marginBottom: "15px", width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px", width: "80%" }}>
              {previews.map((src, index) => {
                const isPreviewable = src.type.startsWith("image/") || src.type.startsWith("video/") || src.type.startsWith("audio/");
               

                return (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                      backgroundColor: "#404040",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: isPreviewable ? "pointer" : "default",
                    }}
                    onClick={(e) => {
                      if (e.target.tagName === "BUTTON" || e.target.tagName === "I") return;
                      openModal(src);
                    }}
                  >
                    <button
                      onClick={() => removeFile(index)}
                      onMouseEnter={() => setDeleteHoverIndex(index)}
                      onMouseLeave={() => setDeleteHoverIndex(null)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: deleteHoverIndex === index ? "black" : "rgba(0,0,0,0.6)",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px 4px",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-xmark" style={{ color: "#F2F0EF", fontSize: "1rem" }}></i>
                    </button>
{isPreviewable ? (
  src.type.startsWith("image/") ? (
 <div style={{ position: "relative", width: "100%", height: "100%" }}>
  <img
    src={`${src.url}`}
    alt=""
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      zIndex: 0
    }}
  />
  <i
    className="fa-solid fa-image"
    style={{
      position: "absolute",
      top: "35%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "1.3rem",
      color: "white",
      opacity: 1,
      pointerEvents: "none"
    }}
  />
  <span 
    style={{ 
      position: "absolute",
      top: "64%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontFamily: "SometypeMono", 
      maxWidth: "95px", 
      overflow: "hidden", 
      whiteSpace: "nowrap", 
      textOverflow: "ellipsis" }}>
        {`${src.name}`}</span>
</div>

  ) : src.type.startsWith("video/") ? (
<div style={{ position: "relative", width: "100%", height: "100%" }}>
    
       <video
  src={`${src.url}`}
  style={{ width: "100%", height: "100%", objectFit: "cover" }}
  muted
  playsInline
  controls={false}
/>
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      zIndex: 0
    }}
  />
   <i
    className="fa-solid fa-video"
    style={{
      position: "absolute",
      top: "35%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "1.3rem",
      color: "white",
      opacity: 1,
      pointerEvents: "none"
    }}
  />
  <span 
    style={{ 
      position: "absolute",
      top: "64%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontFamily: "SometypeMono", 
      maxWidth: "95px", 
      overflow: "hidden", 
      whiteSpace: "nowrap", 
      textOverflow: "ellipsis" }}>
        {`${src.filename}`}</span>
</div>
  ) : src.type.startsWith("audio/") ? (
    <div onClick={(e) => {openModal(src);}} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#F2F0EF", fontSize: "1rem", width: "100%", height: "100%" }}>
                        <i className="fa-solid fa-headphones" style={{ fontSize: "1.3rem", marginBottom: "15px" }} />
                        <span style={{ fontFamily: "SometypeMono", maxWidth: "95px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{src.name}</span>
                      </div>
  ) : null
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#F2F0EF", fontSize: "1rem", width: "100%", height: "100%" }}>
                        <i className="fa-solid fa-paperclip" style={{ fontSize: "1.3rem", marginBottom: "15px" }} />
                        <span style={{ fontFamily: "SometypeMono", maxWidth: "95px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{src.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
<div className="input-wrapper">
        {/* FILE INPUT + POLL + POST */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* ATTACH FILE BUTTON */}
          <label
            htmlFor={attachDisabled ? undefined : fileInputId}
            onMouseEnter={() => !attachDisabled && setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              cursor: attachDisabled ? "not-allowed" : "pointer",
              backgroundColor: "#252525",
              color: attachDisabled ? "#8a8a8a" : hover ? "#d1d1d1ff" : "#F2F0EF",
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              border: "none",
            }}
          >
            <i className="fa-solid fa-paperclip" style={{ color: attachDisabled ? "#8a8a8a" : hover ? "#d1d1d1ff" : "#F2F0EF" }} />
          </label>

          <input id={fileInputId} type="file" multiple style={{ display: "none" }} disabled={attachDisabled} onChange={handleFileChange} />

          {/* POLL BUTTON */}
          <label
            onClick={() => {
              if (!pollDisabled) setPollActive(true);
            }}
            onMouseEnter={() => !pollDisabled && setPollHover(true)}
            onMouseLeave={() => setPollHover(false)}
            style={{
              cursor: pollDisabled ? "" : "pointer",
              backgroundColor: "#252525",
              color: pollDisabled ? "#8a8a8a" : pollHover ? "#d1d1d1ff" : "#F2F0EF",
              marginRight: "215px",
              fontFamily: "SometypeMono",
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              border: "none",
            }}
          >
            <i className="fa-solid fa-square-poll-vertical" style={{ color: pollDisabled ? "#8a8a8a" : pollHover ? "#d1d1d1ff" : "#F2F0EF" }} />
          </label>

<button
onClick={() => {
  setReplyId(0);
  if (!canPost) return;
  handlePost(true);
}}
  onMouseEnter={() => canPost && setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  disabled={!canPost}
  style={{
    backgroundColor: !canPost
      ? "#c0c0c0"               // darkened / inactive
      : isHovered
      ? "#d1d1d1ff"
      : "#F2F0EF",
    padding: "6px 12px",
    border: "none",
    cursor: canPost ? "pointer" : "default",
    opacity: canPost ? 1 : 0.6
  }}
>
  <h2
    style={{
      fontFamily: "SometypeMono",
      color: "black",
      fontSize: "1rem",
      margin: 0,
      fontWeight: "bold"
    }}
  >
    Post
  </h2>
</button>
        </div>
      </div>
    </div>
  </>
  );
}
