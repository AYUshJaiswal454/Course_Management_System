import { useEffect, useState } from 'react';
import { api } from './api';

const blankCourse = { title: '', code: '', description: '', category: 'General', durationWeeks: 8 };
const blankBatch = { name: '', course: '', startDate: '', endDate: '', schedule: '', capacity: 20, status: 'open' };
const date = value => value ? new Date(value).toLocaleDateString() : '-';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ps0_user') || 'null'));
  const [mode, setMode] = useState('login');
  const [auth, setAuth] = useState({ name: '', email: '', password: '' });
  const [page, setPage] = useState('Courses');
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [course, setCourse] = useState(blankCourse);
  const [batch, setBatch] = useState(blankBatch);
  const [showCourse, setShowCourse] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const admin = user?.role === 'admin';

  async function load() {
    try {
      const [c, b] = await Promise.all([api('/courses'), api('/batches')]);
      setCourses(c.courses || []); setBatches(b.batches || []);
      if (user?.role === 'student') {
        const e = await api('/enrollments/mine'); setEnrollments(e.enrollments || []);
      } else if (admin) {
        const e = await api('/enrollments'); setEnrollments(e.enrollments || []);
      }
    } catch (e) { setMessage(e.message); }
  }
  useEffect(() => { if (user) load(); }, [user]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(auth) });
      localStorage.setItem('ps0_token', data.token);
      localStorage.setItem('ps0_user', JSON.stringify(data.user)); setUser(data.user);
    } catch (e) { setMessage(e.message); }
    setBusy(false);
  }
  function logout() {
    localStorage.removeItem('ps0_token'); localStorage.removeItem('ps0_user');
    setUser(null); setCourses([]); setBatches([]); setEnrollments([]);
  }
  async function save(path, data, close) {
    try {
      await api(path, { method: 'POST', body: JSON.stringify(data) });
      close(false); setMessage('Saved successfully.'); load();
    } catch (e) { setMessage(e.message); }
  }
  async function enroll(path, method = 'POST') {
    try { const r = await api(path, { method, body: '{}' }); setMessage(r.message || 'Done.'); load(); }
    catch (e) { setMessage(e.message); }
  }

  if (!user) return <main className="auth"><form className="panel" onSubmit={submit}>
    <h1>Course Manager</h1><h2>{mode === 'login' ? 'Sign in' : 'Register'}</h2>
    {mode === 'register' && <label>Name<input required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} /></label>}
    <label>Email<input required type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} /></label>
    <label>Password<input required type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} /></label>
    {message && <p className="message">{message}</p>}<button disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}</button>
    <p><button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Create an account' : 'Back to sign in'}</button></p>
  </form></main>;

  const pages = ['Courses', 'Batches', ...(user.role === 'student' ? ['My Enrollments'] : []), ...(admin ? ['Enrollments'] : [])];
  return <main className="layout">
    <header><h1>Course Manager</h1><span>{user.name} ({user.role})</span><button className="light" onClick={logout}>Sign out</button></header>
    <nav>{pages.map(p => <button className={page === p ? 'selected' : 'light'} key={p} onClick={() => setPage(p)}>{p}</button>)}</nav>
    {message && <p className="message" onClick={() => setMessage('')}>{message} ×</p>}

    {page === 'Courses' && <section><div className="heading"><h2>Courses</h2>{admin && <button onClick={() => setShowCourse(true)}>Add course</button>}</div>
      <div className="cards">{courses.map(c => <article className="panel" key={c._id}><h3>{c.title}</h3><p>{c.description}</p><p>Code: {c.code}</p><p>Category: {c.category} · {c.durationWeeks} weeks</p></article>)}</div>
      {!courses.length && <p>No courses available.</p>}
    </section>}

    {page === 'Batches' && <section><div className="heading"><h2>Batches</h2>{admin && <button onClick={() => { setBatch({ ...blankBatch, course: courses[0]?._id || '' }); setShowBatch(true); }}>Add batch</button>}</div>
      <div className="cards">{batches.map(b => <article className="panel" key={b._id}><h3>{b.name}</h3><p>Course: {b.course?.title || '-'}</p><p>{date(b.startDate)} - {date(b.endDate)}</p><p>{b.schedule}</p><p>Seats: {b.enrolledCount || 0}/{b.capacity} · {b.status}</p>
        {user.role === 'student' && <button disabled={b.status !== 'open' || (b.enrolledCount || 0) >= b.capacity} onClick={() => enroll(`/enrollments/${b._id}`)}>Enroll</button>}</article>)}</div>
      {!batches.length && <p>No batches available.</p>}
    </section>}

    {page === 'My Enrollments' && <section className="panel"><h2>My Enrollments</h2>{enrollments.map(e => <div className="item" key={e._id}><div><b>{e.batch?.course?.title || 'Course'}</b><p>{e.batch?.name} · {date(e.batch?.startDate)} · {e.status}</p></div>{e.status === 'enrolled' && <button className="danger" onClick={() => enroll(`/enrollments/${e._id}/cancel`, 'PATCH')}>Cancel</button>}</div>)}{!enrollments.length && <p>No enrollments yet.</p>}</section>}

    {page === 'Enrollments' && <section className="panel"><h2>All Enrollments</h2>{enrollments.map(e => <div className="item" key={e._id}><div><b>{e.student?.name}</b><p>{e.student?.email} · {e.batch?.course?.title} · {e.batch?.name} · {e.status}</p></div></div>)}{!enrollments.length && <p>No enrollments yet.</p>}</section>}

    {showCourse && <div className="shade"><form className="panel modal" onSubmit={e => { e.preventDefault(); save('/courses', { ...course, durationWeeks: Number(course.durationWeeks) }, setShowCourse); setCourse(blankCourse); }}><h2>Add course</h2>
      <label>Title<input required value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} /></label>
      <label>Code<input required value={course.code} onChange={e => setCourse({ ...course, code: e.target.value })} /></label>
      <label>Category<input value={course.category} onChange={e => setCourse({ ...course, category: e.target.value })} /></label>
      <label>Description<textarea value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} /></label>
      <label>Duration (weeks)<input required type="number" min="1" value={course.durationWeeks} onChange={e => setCourse({ ...course, durationWeeks: e.target.value })} /></label>
      <button>Create</button> <button type="button" className="light" onClick={() => setShowCourse(false)}>Cancel</button>
    </form></div>}

    {showBatch && <div className="shade"><form className="panel modal" onSubmit={e => { e.preventDefault(); save('/batches', { ...batch, capacity: Number(batch.capacity) }, setShowBatch); setBatch(blankBatch); }}><h2>Add batch</h2>
      <label>Name<input required value={batch.name} onChange={e => setBatch({ ...batch, name: e.target.value })} /></label>
      <label>Course<select required value={batch.course} onChange={e => setBatch({ ...batch, course: e.target.value })}><option value="">Choose course</option>{courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}</select></label>
      <label>Start date<input required type="date" value={batch.startDate} onChange={e => setBatch({ ...batch, startDate: e.target.value })} /></label>
      <label>End date<input required type="date" min={batch.startDate} value={batch.endDate} onChange={e => setBatch({ ...batch, endDate: e.target.value })} /></label>
      <label>Schedule<input required placeholder="Mon and Wed, 6 PM" value={batch.schedule} onChange={e => setBatch({ ...batch, schedule: e.target.value })} /></label>
      <label>Capacity<input required type="number" min="1" value={batch.capacity} onChange={e => setBatch({ ...batch, capacity: e.target.value })} /></label>
      <label>Status<select value={batch.status} onChange={e => setBatch({ ...batch, status: e.target.value })}>{['open', 'upcoming', 'in-progress', 'completed', 'cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>
      <button>Create</button> <button type="button" className="light" onClick={() => setShowBatch(false)}>Cancel</button>
    </form></div>}
  </main>;
}
