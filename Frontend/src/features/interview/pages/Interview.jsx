import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'


const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day, completed, onToggle }) => (
    <div className={`roadmap-day ${completed ? 'roadmap-day--completed' : ''}`}>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
            <button
                onClick={() => onToggle(day.day)}
                style={{
                    marginLeft: 'auto',
                    padding: '0.2rem 0.7rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: '2rem',
                    border: completed ? '1px solid rgba(63, 185, 80, 0.3)' : '1px solid rgba(255, 45, 120, 0.3)',
                    background: completed ? 'rgba(63, 185, 80, 0.1)' : 'rgba(255, 45, 120, 0.08)',
                    color: completed ? '#3fb950' : '#ff2d78',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                }}>
                {completed ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Completed
                    </>
                ) : 'Mark as Complete'}
            </button>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const [customDays, setCustomDays] = useState(null)
    const [showDaysInput, setShowDaysInput] = useState(false)
    const [daysInput, setDaysInput] = useState("")
    const [roadmapLoading, setRoadmapLoading] = useState(false)
    const [completedDays, setCompletedDays] = useState([])

    const toggleDayComplete = (day) => {
        setCompletedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const { report, getReportById, loading, regenerateRoadmapPlan } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    useEffect(() => {
    if (report) {
        document.title = `${report.title} | InterviewPrep AI`
    }
    }, [report])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff2d78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    const handleGenerateRoadmap = async () => {
        if (!daysInput || daysInput < 1) return
        setRoadmapLoading(true)
        setShowDaysInput(false)
        setCustomDays(Number(daysInput))
        await regenerateRoadmapPlan({ interviewReportId: interviewId, days: Number(daysInput) })
        setRoadmapLoading(false)
        setActiveNav('roadmap')
    }

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Customize Plan Button */}
                    {!showDaysInput && !roadmapLoading ? (
                      <button
    onClick={() => setShowDaysInput(true)}
    className='button primary-button'
    style={{ whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.4' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.2rem", flexShrink: 0 }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    Customize Your Preparation Plan
</button>
                    ) : roadmapLoading ? (
                        <button className='button primary-button' disabled style={{ whiteSpace: 'nowrap', opacity: 0.8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.2rem", animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                            Customizing Your Plan...
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>How many days do you want to prepare?</p>
                            <input
                                type='number'
                                min={1}
                                max={30}
                                value={daysInput}
                                onChange={(e) => setDaysInput(e.target.value)}
                                placeholder='e.g. 7'
                                style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleGenerateRoadmap}
                                    className='button primary-button'
                                    style={{ flex: 1, justifyContent: 'center' }}>
                                    Generate
                                </button>
                                <button
                                    onClick={() => setShowDaysInput(false)}
                                    className="button primary-button"
                                    style={{ background: 'transparent', color: 'white', border: '1px solid #ccc', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>Top {report.technicalQuestions.length} questions most likely to be asked</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>Top {report.behavioralQuestions.length} questions most likely to be asked</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{(customDays || report.preparationPlan.length)}-day plan</span>
                            </div>
                            {roadmapLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '2rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                                    <p>Customizing your preparation plan...</p>
                                </div>
                            ) : (
                               <div className='roadmap-list'>
    {report.preparationPlan.map((day) => (
        <RoadMapDay
            key={day.day}
            day={day}
            completed={completedDays.includes(day.day)}
            onToggle={toggleDayComplete}
        />
    ))}
</div>
                            )}
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview