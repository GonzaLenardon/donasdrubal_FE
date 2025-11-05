const Spinner = ({ loading, msg }) => {
  if (!loading) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: 'rgba(0, 0, 0,.9)', zIndex: 9999 }}
    >
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: '3rem', height: '3rem' }}
      />
      <span className="text-primary fs-3 fw-bold mt-2">{msg}</span>
    </div>
  );
};

export default Spinner;
