"use client";

export interface ReplyMessageBoxProps {
  reply: {
    content: string;
  };
  className?: string;
}

export function ReplyMessageBox({ reply, className = "" }: ReplyMessageBoxProps) {
  return (
    <div className={`${className}`}>
      <div
        id="reply-bubble"
        className="relative mt-[50px] min-h-48 rounded-[20px] border-2 border-[#A55D4F] bg-[#FDF1EA] p-[20px]"
      >
        <div id="name-tag" className="absolute" />
        <div>{reply.content}</div>
      </div>
    </div>
  );
}
