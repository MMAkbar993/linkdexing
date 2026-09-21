import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { privateApi } from "../api";
import { orderUrl } from "../api/endpoints";
import { readCsvFile, URL_LIKE } from "../utils/csv";
import Sidebar from "../components/Sidebar";

// Dashboard or Home page
export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  // Appends URLs from a CSV/txt file into the same textarea the user would
  // otherwise paste into, so both input methods feed one submission path.
  const handleCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await readCsvFile(file);
      if (result.urls.length === 0) {
        toast.error("No valid URLs found in that file.");
        return;
      }
      const existing = (getValues("links") || "").trim();
      setValue(
        "links",
        existing ? `${existing}\n${result.urls.join("\n")}` : result.urls.join("\n"),
        { shouldValidate: true }
      );
      toast.success(
        `Loaded ${result.urls.length.toLocaleString("en-US")} link(s)` +
          (result.skipped ? `, skipped ${result.skipped} non-URL row(s)` : "")
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      //createOrder
      await privateApi.post(`${orderUrl}`, values);
      toast.success("Links Added");
      //Reset form
      reset();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mt-2' style={{ minHeight: "80vh" }}>
      <div className='row'>
        <div className='col-sm-12 col-md-9'>
          <div
            className='card w-100 my-4'
            style={{ width: 500, marginLeft: 20 }}
          >
            <div className='card-body'>
              <form
                className='form-control-sm'
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className='accordion mb-3'>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOne'
                        aria-expanded='true'
                        aria-controls='collapseOne'
                      >
                        How to Add Links ?
                      </button>
                    </h2>
                    <div
                      id='collapseOne'
                      className='accordion-collapse collapse show'
                      aria-labelledby='headingOne'
                    >
                      <div className='accordion-body'>
                        Please add links in the box below as per the following
                        format:-
                        <ul>
                          http://link1.com <br />
                          http://link2.com <br />
                          https://link3.com
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mb-3'>
                  <div className='input-group'>
                    <span className='input-group-text'>Paste Links</span>
                    <textarea
                      disabled={loading}
                      className='form-control'
                      aria-label='With textarea'
                      {...register("links", {
                        required: true,
                        // Each non-blank line must look like a real URL -
                        // otherwise it can silently sit unmatched later, when
                        // an index check runs against it (IndexChecker.link
                        // still "checks" malformed input, but the result can
                        // never be matched back to it).
                        validate: (value) => {
                          const lines = value
                            .split("\n")
                            .map((l) => l.trim())
                            .filter(Boolean);
                          return (
                            lines.every((l) => URL_LIKE.test(l)) ||
                            "Every line must be a full URL, starting with http://, https://, or www."
                          );
                        },
                      })}
                    ></textarea>
                    {errors?.links?.message && (
                      <div className='text-danger mt-1'>
                        {errors.links.message}
                      </div>
                    )}
                  </div>
                  <div className='mt-2'>
                    <input
                      ref={fileRef}
                      type='file'
                      accept='.csv,.txt'
                      onChange={handleCsv}
                      style={{ display: "none" }}
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary btn-sm'
                      onClick={() => fileRef.current?.click()}
                      disabled={loading}
                    >
                      Upload CSV
                    </button>
                    <small className='text-muted ms-2'>
                      One URL per line, or a single-column CSV.
                    </small>
                  </div>
                </div>
                <div className='mb-3'>
                  <div className='input-group mb-3'>
                    <div className='input-group mb-1'>
                      <span className='input-group-text'>
                        Dripfeed (Number of days)
                      </span>
                      <input
                        type='number'
                        disabled={loading}
                        className='form-control'
                        placeholder='        Range of 1 to 30'
                        {...register("dripfeed", {
                          required: true,
                          max: 30,
                          min: 1,
                        })}
                      />
                    </div>
                    {errors?.dripfeed && (
                      <div className='text-danger'>
                        * Must be between 1 and 30
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type='submit'
                    disabled={loading}
                    className='btn btn-primary btn-lg'
                  >
                    {loading ? (
                      <>
                        <span
                          className='spinner-border spinner-border-sm'
                          role='status'
                          aria-hidden='true'
                        />
                        <span className='ml-1'>Adding Links...</span>
                      </>
                    ) : (
                      "Add Links"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
