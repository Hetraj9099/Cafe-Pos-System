const BottomSheet = ({ open, title, action, onClose, children }) => {
  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        open ? 'pointer-events-auto bg-slate-950/35' : 'pointer-events-none bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-[24px] bg-white p-4 shadow-2xl transition lg:bottom-6 lg:left-auto lg:right-6 lg:top-6 lg:w-[430px] lg:rounded-xl ${
          open
            ? 'translate-y-0 lg:translate-y-0 lg:translate-x-0'
            : 'translate-y-full lg:translate-y-0 lg:translate-x-[110%]'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-slate-950">{title}</h2>
          </div>
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
};

export default BottomSheet;
