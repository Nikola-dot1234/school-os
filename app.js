/* =========================
   SCHOOL OS v1.0
========================= */

const appContent=document.getElementById("app-content");
const navButtons=document.querySelectorAll(".nav-button");

const times=[null,["1","08:30","09:15"],["2","09:20","10:05"],["3","10:35","11:20"],["4","11:25","12:10"],["5","12:20","13:05"],["6","13:10","13:55"],["7","14:05","14:50"],["8","14:55","15:40"],["9","15:45","16:30"]];

const subjects=["Dějepis","History","Class Teacher Hour","ZSV","Mathematics","Czech","French","English","Geography","Physics","Chemistry","Biology","Integrated Science","ICT","PE","Economics / Business / Finance"];

/* Thursday FIXED: 1 Free + 2 Integrated Science + 2 Economics */
const timetable={
  1:["Dějepis","History","Class Teacher Hour","ZSV","Mathematics","Czech","Free","English"],
  2:["PE","PE","Dějepis","Physics","Mathematics","Free","Chemistry","French"],
  3:["English","English","Biology","Geography","Czech","Czech","Free","History","ZSV"],
  4:["Mathematics","Mathematics","French","Physics","Free","Integrated Science","Integrated Science","Economics / Business / Finance","Economics / Business / Finance"],
  5:["Czech","ICT","French","English","Chemistry","Biology","Free","Geography"]
};

let tasks=JSON.parse(localStorage.getItem("schoolOS_tasks")||"[]");
let tests=JSON.parse(localStorage.getItem("schoolOS_tests")||"[]");
let events=JSON.parse(localStorage.getItem("schoolOS_events")||"[]");
let grades=JSON.parse(localStorage.getItem("schoolOS_grades")||"[]");

function saveData(){
  localStorage.setItem("schoolOS_tasks",JSON.stringify(tasks));
  localStorage.setItem("schoolOS_tests",JSON.stringify(tests));
  localStorage.setItem("schoolOS_events",JSON.stringify(events));
  localStorage.setItem("schoolOS_grades",JSON.stringify(grades));
}
function todayString(){return new Date().toISOString().split("T")[0]}
function dateObj(s){return new Date(s+"T00:00:00")}
function formatDate(s){if(!s)return "";return dateObj(s).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
function daysUntil(s){const a=new Date();a.setHours(0,0,0,0);const b=dateObj(s);return Math.ceil((b-a)/86400000)}
function getDayNumber(d=new Date()){const n=d.getDay();return n===0?7:n}
function getTimeMinutes(t){const [h,m]=t.split(":").map(Number);return h*60+m}
function currentMinutes(){const d=new Date();return d.getHours()*60+d.getMinutes()}
function escapeHTML(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]))}
function subjectOptions(selected=""){return `<option value="">Select subject</option>`+subjects.map(s=>`<option ${s===selected?"selected":""}>${escapeHTML(s)}</option>`).join("")}
function eventOccursOn(event,dateString){
  const start=dateObj(event.date), current=dateObj(dateString); let diff=Math.round((current-start)/86400000);
  if(event.repeat==="weekly")return diff>=0&&diff%7===0;
  if(event.repeat==="biweekly")return diff>=0&&diff%14===0;
  if(event.repeat==="monthly")return current>=start&&current.getDate()===start.getDate();
  return event.date===dateString;
}
function eventsOn(dateString){return events.filter(e=>eventOccursOn(e,dateString))}

/* =========================
   HOME
========================= */
function renderHome(){
  const now=new Date(), day=getDayNumber(now), schedule=timetable[day]||[], current=currentMinutes();
  let currentIndex=-1,nextIndex=-1;
  schedule.forEach((subject,i)=>{const t=times[i+1];if(!t)return;const a=getTimeMinutes(t[1]),b=getTimeMinutes(t[2]);if(current>=a&&current<b)currentIndex=i;if(nextIndex===-1&&current<a)nextIndex=i});
  const hour=now.getHours(); const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  let todayEvents=eventsOn(todayString()).sort((a,b)=>(a.start||"").localeCompare(b.start||""));
  const todayTasks=tasks.filter(t=>t.due===todayString()&&!t.completed);
  const upcomingTests=tests.filter(t=>daysUntil(t.date)>=0).sort((a,b)=>dateObj(a.date)-dateObj(b.date)).slice(0,3);
  const overdue=tasks.filter(t=>!t.completed&&daysUntil(t.due)<0).length;
  const completed=tasks.filter(t=>t.completed).length;
  const progress=tasks.length?Math.round(completed/tasks.length*100):0;
  const nextTest=upcomingTests[0];
  let tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1); const tomorrowSchedule=timetable[getDayNumber(tomorrow)]||[];
  const tomorrowHTML=tomorrow.getDay()===0||tomorrow.getDay()===6?`<div class="empty">No school tomorrow.</div>`:tomorrowSchedule.map((s,i)=>`<div class="tomorrow-item"><span class="tomorrow-subject">${escapeHTML(s)}</span><span class="tomorrow-time">${times[i+1][1]}–${times[i+1][2]}</span></div>`).join("");
  const currentSubject=currentIndex>=0?schedule[currentIndex]:"No class right now";
  const currentTime=currentIndex>=0?`${times[currentIndex+1][1]}–${times[currentIndex+1][2]}`:"School day overview";
  const nextHTML=nextIndex>=0?`<div class="next-card"><div><div class="next-label">Next class</div><div class="next-subject">${escapeHTML(schedule[nextIndex])}</div></div><div class="next-time">${times[nextIndex+1][1]}–${times[nextIndex+1][2]}</div></div>`:`<div class="next-card"><div><div class="next-label">Schedule</div><div class="next-subject">No more classes today</div></div></div>`;
  const eventHTML=todayEvents.length?todayEvents.map(e=>`<div class="mini-event"><strong>${escapeHTML(e.name)}</strong><span>${e.start||""}${e.end?`–${e.end}`:""}</span></div>`).join(""):``;
  const testHTML=upcomingTests.length?upcomingTests.map(t=>{const d=daysUntil(t.date);const label=d===0?"Today":d===1?"Tomorrow":`${d} days`;return `<div class="test-item"><div class="item-main"><div class="item-title">${escapeHTML(t.subject)}</div><div class="item-meta">${escapeHTML(t.topic)} · ${formatDate(t.date)}</div></div><div class="countdown">${label}</div></div>`}).join(""):`<div class="empty">No upcoming tests.</div>`;
  appContent.innerHTML=`
    <div class="greeting"><h1>${greeting} 👋</h1><p>Here’s your school day at a glance.</p><div class="quick-actions"><button onclick="openTaskModal()">+ Add task</button><button onclick="openTestModal()">+ Add test</button><button onclick="openEventModal()">+ Add event</button></div></div>
    <div class="dashboard-grid">
      <div>
        <section class="card"><h2>Today</h2><p class="card-subtitle">${now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</p><div class="now-card"><div class="now-label">Now</div><div class="now-subject">${escapeHTML(currentSubject)}</div><div class="now-time">${currentTime}</div></div>${nextHTML}${eventHTML?`<div class="today-events">${eventHTML}</div>`:""}</section>
        <section class="card" style="margin-top:20px"><h2>Tomorrow</h2><p class="card-subtitle">A quick look ahead</p><div class="tomorrow-list">${tomorrowHTML}</div></section>
      </div>
      <div>
        <section class="card"><h2>Up next</h2><p class="card-subtitle">The things most worth noticing.</p><div class="item-list">${testHTML}</div>${nextTest?`<div class="focus-card"><h2>Focus</h2><p>${escapeHTML(nextTest.subject)} · ${escapeHTML(nextTest.topic)} · ${daysUntil(nextTest.date)===0?"today":formatDate(nextTest.date)}</p><button class="add-button" style="margin-top:12px" onclick="openPlanner('${nextTest.id}')">Plan study</button></div>`:""}</section>
        <section class="card" style="margin-top:20px"><h2>This week</h2><p class="card-subtitle">Your school overview</p><div class="dashboard-stat-grid"><div class="stat"><div class="stat-value">${tasks.filter(t=>!t.completed).length}</div><div class="stat-label">tasks left</div></div><div class="stat"><div class="stat-value">${overdue}</div><div class="stat-label">overdue</div></div><div class="stat"><div class="stat-value">${tests.length}</div><div class="stat-label">tests planned</div></div></div><div class="progress-box"><div class="progress-label"><span>Tasks completed</span><span>${completed}/${tasks.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></div></section>
      </div>
    </div>`;
}

/* ========================= TASKS ========================= */
function renderTasks(){
  const sorted=[...tasks].sort((a,b)=>dateObj(a.due)-dateObj(b.due));
  const html=sorted.length?sorted.map(t=>{const d=daysUntil(t.due), label=d===0?"Due today":d===1?"Due tomorrow":d<0?"Overdue":`${d} days left`;return `<div class="task-item ${t.completed?"completed":""}"><input class="check-task" type="checkbox" ${t.completed?"checked":""} onchange="toggleTask('${t.id}')"><div class="item-main"><div class="item-title">${escapeHTML(t.name)}</div><div class="item-meta"><span class="badge">${escapeHTML(t.type)}</span>${escapeHTML(t.subject||"Other")} · ${formatDate(t.due)} · ${t.time} min</div></div><div class="countdown">${label}</div><div class="task-actions"><button class="small-button" onclick="editTask('${t.id}')">✎</button><button class="small-button" onclick="deleteTask('${t.id}')">×</button></div></div>`}).join(""):`<div class="empty">No tasks yet. You’re all caught up.</div>`;
  appContent.innerHTML=`<div class="page-header"><div><h1>Tasks</h1><p class="page-description">Everything you need to get done.</p></div><button class="add-button" onclick="openTaskModal()">+ Add task</button></div><section class="card"><div class="item-list">${html}</div></section>`;
}
function toggleTask(id){const t=tasks.find(x=>x.id===id);if(!t)return;t.completed=!t.completed;saveData();renderTasks()}
function deleteTask(id){tasks=tasks.filter(x=>x.id!==id);saveData();renderTasks()}
let editingTaskId=null;
function openTaskModal(id=null){editingTaskId=id;const form=document.getElementById("task-form");form.reset();const t=id&&tasks.find(x=>x.id===id);if(t){document.getElementById("task-type").value=t.type;document.getElementById("task-subject").value=t.subject||"";document.getElementById("task-name").value=t.name;document.getElementById("task-due").value=t.due;document.getElementById("task-time").value=t.time;document.getElementById("task-modal-title").textContent="Edit Task"}else{document.getElementById("task-due").value=todayString();document.getElementById("task-modal-title").textContent="Add Task"} updateTaskSubjectField();document.getElementById("task-modal").classList.remove("hidden")}
function editTask(id){openTaskModal(id)}
function closeTaskModal(){document.getElementById("task-modal").classList.add("hidden");editingTaskId=null}
function updateTaskSubjectField(){const other=document.getElementById("task-type").value==="other",field=document.getElementById("subject-field"),subject=document.getElementById("task-subject");field.style.display=other?"none":"flex";subject.required=!other;if(other)subject.value=""}

/* ========================= TESTS + STUDY PLANNER ========================= */
function renderTests(){
  const sorted=[...tests].sort((a,b)=>dateObj(a.date)-dateObj(b.date));
  const html=sorted.length?sorted.map(t=>{const d=daysUntil(t.date),label=d===0?"Today":d===1?"Tomorrow":d<0?"Past":`${d} days left`;return `<div class="test-item"><div class="item-main"><div class="item-title">${escapeHTML(t.subject)} <span class="badge">${t.time} min study</span></div><div class="item-meta">${escapeHTML(t.topic)} · ${formatDate(t.date)}</div>${t.notes?`<div class="test-notes">${escapeHTML(t.notes)}</div>`:""}${t.plan?.length?plannerHTML(t):""}</div><div class="countdown">${label}</div><div class="test-actions"><button class="small-button" onclick="openPlanner('${t.id}')">🎯</button><button class="small-button" onclick="editTest('${t.id}')">✎</button><button class="small-button" onclick="deleteTest('${t.id}')">×</button></div></div>`}).join(""):`<div class="empty">No tests added yet.</div>`;
  appContent.innerHTML=`<div class="page-header"><div><h1>Tests</h1><p class="page-description">Upcoming tests, topics and study time.</p></div><button class="add-button" onclick="openTestModal()">+ Add test</button></div><section class="card"><div class="item-list">${html}</div></section>`;
}
function plannerHTML(t){const done=t.plan.filter(x=>x.done).length;return `<div class="planner-box"><div class="planner-header"><div><div class="planner-title">Study plan · ${done}/${t.plan.length}</div><div class="planner-meta">${t.time} minutes planned</div></div><span class="pill">${Math.round(done/t.plan.length*100)}%</span></div>${t.plan.map((p,i)=>`<label class="planner-row"><input type="checkbox" ${p.done?"checked":""} onchange="toggleStudySession('${t.id}',${i})"><span class="date">${formatDate(p.date)}</span><span class="minutes">${p.minutes} min</span></label>`).join("")}</div>`}
function openPlanner(id){const t=tests.find(x=>x.id===id);if(!t)return;const total=Number(t.time||60),days=Math.max(1,Math.min(5,Math.ceil(daysUntil(t.date))));let dates=[];for(let i=days-1;i>=0;i--){const d=dateObj(t.date);d.setDate(d.getDate()-i);if(d>=dateObj(todayString()))dates.push(d.toISOString().split("T")[0])}if(!dates.length)dates=[todayString()];const base=Math.floor(total/dates.length),rem=total%dates.length;t.plan=dates.map((date,i)=>({date,minutes:base+(i===dates.length-1?rem:0),done:false}));saveData();renderTests()}
function toggleStudySession(testId,index){const t=tests.find(x=>x.id===testId);if(!t?.plan?.[index])return;t.plan[index].done=!t.plan[index].done;saveData();renderTests()}
let editingTestId=null;
function openTestModal(id=null){editingTestId=id;const form=document.getElementById("test-form");form.reset();const t=id&&tests.find(x=>x.id===id);if(t){document.getElementById("test-subject").value=t.subject;document.getElementById("test-topic").value=t.topic;document.getElementById("test-date").value=t.date;document.getElementById("test-time").value=t.time;document.getElementById("test-notes").value=t.notes||"";document.getElementById("test-modal-title").textContent="Edit Test"}else{document.getElementById("test-date").value=todayString();document.getElementById("test-modal-title").textContent="Add Test"}document.getElementById("test-modal").classList.remove("hidden")}
function editTest(id){openTestModal(id)}
function deleteTest(id){tests=tests.filter(x=>x.id!==id);saveData();renderTests()}
function closeTestModal(){document.getElementById("test-modal").classList.add("hidden");editingTestId=null}

/* ========================= CALENDAR MONTH / WEEK ========================= */
let calendarDate=new Date();let calendarView="month";
function calendarDateString(y,m,d){return new Date(y,m,d).toISOString().split("T")[0]}
function calendarItemsForDate(dateString){const items=[];eventsOn(dateString).forEach(e=>items.push({type:"event",time:e.start||"",text:e.name}));tasks.filter(t=>t.due===dateString).forEach(t=>items.push({type:"task",time:"",text:`✓ ${t.name}`}));tests.filter(t=>t.date===dateString).forEach(t=>items.push({type:"test",time:"",text:`🧪 ${t.subject}`}));return items}
function renderCalendar(){
  const monthName=calendarDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  appContent.innerHTML=`<div class="page-header"><div><h1>Calendar</h1><p class="page-description">Tasks, tests and events in one place.</p></div><button class="add-button" onclick="openEventModal()">+ Add event</button></div><section class="card"><div class="calendar-toolbar"><div class="calendar-nav"><button class="calendar-arrow" onclick="changePeriod(-1)">‹</button><h3>${calendarView==="month"?monthName:weekTitle()}</h3><button class="calendar-arrow" onclick="changePeriod(1)">›</button></div><div class="view-toggle"><button class="${calendarView==="month"?"active":""}" onclick="setCalendarView('month')">Month</button><button class="${calendarView==="week"?"active":""}" onclick="setCalendarView('week')">Week</button></div></div>${calendarView==="month"?monthCalendarHTML():weekCalendarHTML()}</section>`;
}
function monthCalendarHTML(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1);let start=first.getDay();if(start===0)start=7;const total=new Date(y,m+1,0).getDate();let cells="";for(let i=1;i<start;i++)cells+=`<div class="calendar-day"></div>`;for(let d=1;d<=total;d++){const ds=calendarDateString(y,m,d),today=ds===todayString();cells+=`<div class="calendar-day ${today?"today":""}"><div class="calendar-day-number">${d}</div>${calendarItemsForDate(ds).map(x=>`<div class="calendar-event calendar-${x.type}">${escapeHTML(x.text)}${x.time?` · ${x.time}`:""}</div>`).join("")}</div>`}return `<div class="calendar-weekdays"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div></div><div class="calendar-grid">${cells}</div>`}
function mondayOfWeek(d){const x=new Date(d);const n=x.getDay()||7;x.setDate(x.getDate()-n+1);x.setHours(0,0,0,0);return x}
function weekTitle(){const start=mondayOfWeek(calendarDate),end=new Date(start);end.setDate(start.getDate()+6);return `${start.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}`}
function weekCalendarHTML(){
  const start=mondayOfWeek(calendarDate);
  const rows=times.slice(1).map((t,i)=>{
    let cells=`<div class="week-time">${t[1]}</div>`;
    for(let d=0;d<7;d++){
      const date=new Date(start);date.setDate(start.getDate()+d);
      const ds=date.toISOString().split("T")[0];
      const items=[];
      const subj=timetable[getDayNumber(date)]?.[i];
      if(subj)items.push(`<div class="week-item">${escapeHTML(subj)}<br><small>${t[1]}–${t[2]}</small></div>`);
      eventsOn(ds).filter(e=>e.start===t[1]).forEach(e=>items.push(`<div class="week-item event">${escapeHTML(e.name)}<br><small>${e.start}–${e.end}</small></div>`));
      if(i===0){
        tasks.filter(x=>x.due===ds).forEach(x=>items.push(`<div class="week-item task">✓ ${escapeHTML(x.name)}</div>`));
        tests.filter(x=>x.date===ds).forEach(x=>items.push(`<div class="week-item test">🧪 ${escapeHTML(x.subject)}</div>`));
      }
      cells+=`<div class="week-cell">${items.join("")}</div>`;
    }
    return `<div class="week-row">${cells}</div>`;
  }).join("");
  let head=`<div class="week-time"></div>`;
  for(let d=0;d<7;d++){const date=new Date(start);date.setDate(start.getDate()+d);head+=`<div class="week-head">${date.toLocaleDateString("en-GB",{weekday:"short"})}<br>${date.getDate()}</div>`}
  return `<div class="week-view"><div class="week-grid">${head}${rows}</div></div>`;
}
function setCalendarView(v){calendarView=v;renderCalendar()}
function changePeriod(amount){if(calendarView==="month")calendarDate.setMonth(calendarDate.getMonth()+amount);else calendarDate.setDate(calendarDate.getDate()+amount*7);renderCalendar()}

/* ========================= EVENT MODAL ========================= */
function openEventModal(){document.getElementById("event-form").reset();document.getElementById("event-date").value=todayString();document.getElementById("event-modal").classList.remove("hidden")}
function closeEventModal(){document.getElementById("event-modal").classList.add("hidden")}

/* ========================= GRADES ========================= */
function gradeAverage(subject){const list=grades.filter(g=>g.subject===subject);if(!list.length)return null;const weighted=list.reduce((s,g)=>s+Number(g.grade)*Number(g.weight),0),weight=list.reduce((s,g)=>s+Number(g.weight),0);return weighted/weight}
function renderGrades(){
  const used=subjects.filter(s=>grades.some(g=>g.subject===s));
  const overview=used.length?used.map(s=>{const avg=gradeAverage(s),weight=grades.filter(g=>g.subject===s).reduce((a,g)=>a+Number(g.weight),0);return `<div class="grade-subject-card"><div class="grade-subject-name">${escapeHTML(s)}</div><div class="grade-average">${avg.toFixed(2)}</div><div class="grade-weight-info">weighted average · ${weight.toFixed(1)} total weight</div></div>`}).join(""):`<div class="empty">Add your first grade to start seeing your averages.</div>`;
  const sections=used.map(s=>{const list=grades.filter(g=>g.subject===s).sort((a,b)=>b.created-a.created);return `<div class="grade-section"><div class="grade-section-header"><div><h3>${escapeHTML(s)}</h3><div class="item-meta">Average ${gradeAverage(s).toFixed(2)}</div></div><button class="small-button" onclick="openGradeModal(null,'${encodeURIComponent(s)}')">+</button></div><div class="card" style="padding:0 18px"><div class="grade-list">${list.map(g=>`<div class="grade-row"><div class="grade-value">${g.grade}</div><div class="grade-name">${escapeHTML(g.name)}</div><div class="grade-weight">× ${Number(g.weight).toFixed(1)}</div><div class="grade-actions"><button class="small-button" onclick="editGrade('${g.id}')">✎</button><button class="small-button" onclick="deleteGrade('${g.id}')">×</button></div></div>`).join("")}</div></div></div>`}).join("");
  appContent.innerHTML=`<div class="page-header"><div><h1>Grades</h1><p class="page-description">Weighted averages for every subject.</p></div><button class="add-button" onclick="openGradeModal()">+ Add grade</button></div><div class="grades-overview">${overview}</div>${sections||`<section class="card"><div class="empty">No grades yet. Your gradebook will appear here.</div></section>`}`;
}
let editingGradeId=null;
function openGradeModal(id=null,preset=""){editingGradeId=id;const form=document.getElementById("grade-form");form.reset();const g=id&&grades.find(x=>x.id===id);if(g){document.getElementById("grade-subject").value=g.subject;document.getElementById("grade-name").value=g.name;document.getElementById("grade-value").value=g.grade;document.getElementById("grade-weight").value=g.weight;document.getElementById("grade-modal-title").textContent="Edit Grade"}else{if(preset)document.getElementById("grade-subject").value=decodeURIComponent(preset);document.getElementById("grade-modal-title").textContent="Add Grade"}document.getElementById("grade-modal").classList.remove("hidden")}
function editGrade(id){openGradeModal(id)}
function deleteGrade(id){grades=grades.filter(g=>g.id!==id);saveData();renderGrades()}
function closeGradeModal(){document.getElementById("grade-modal").classList.add("hidden");editingGradeId=null}

/* ========================= EVENT LISTENERS ========================= */
document.getElementById("close-task-modal").addEventListener("click",closeTaskModal);document.getElementById("cancel-task").addEventListener("click",closeTaskModal);document.getElementById("task-type").addEventListener("change",updateTaskSubjectField);
document.getElementById("task-form").addEventListener("submit",e=>{e.preventDefault();const data={id:editingTaskId||Date.now().toString(),type:document.getElementById("task-type").value,subject:document.getElementById("task-subject").value,name:document.getElementById("task-name").value.trim(),due:document.getElementById("task-due").value,time:Number(document.getElementById("task-time").value)};if(editingTaskId){const i=tasks.findIndex(t=>t.id===editingTaskId);if(i>=0){data.completed=tasks[i].completed;tasks[i]=data}}else{data.completed=false;tasks.push(data)}saveData();closeTaskModal();showPage("tasks")});
document.getElementById("close-test-modal").addEventListener("click",closeTestModal);document.getElementById("cancel-test").addEventListener("click",closeTestModal);document.getElementById("test-form").addEventListener("submit",e=>{e.preventDefault();const data={id:editingTestId||Date.now().toString(),subject:document.getElementById("test-subject").value,topic:document.getElementById("test-topic").value.trim(),date:document.getElementById("test-date").value,time:Number(document.getElementById("test-time").value),notes:document.getElementById("test-notes").value.trim(),completed:false};if(editingTestId){const i=tests.findIndex(t=>t.id===editingTestId);if(i>=0){data.plan=tests[i].plan||[];tests[i]={...tests[i],...data}}}else tests.push(data);saveData();closeTestModal();showPage("tests")});
document.getElementById("close-event-modal").addEventListener("click",closeEventModal);document.getElementById("cancel-event").addEventListener("click",closeEventModal);document.getElementById("event-form").addEventListener("submit",e=>{e.preventDefault();events.push({id:Date.now().toString(),name:document.getElementById("event-name").value.trim(),date:document.getElementById("event-date").value,start:document.getElementById("event-start").value,end:document.getElementById("event-end").value,repeat:document.getElementById("event-repeat").value});saveData();closeEventModal();showPage("calendar")});
document.getElementById("close-grade-modal").addEventListener("click",closeGradeModal);document.getElementById("cancel-grade").addEventListener("click",closeGradeModal);document.getElementById("grade-form").addEventListener("submit",e=>{e.preventDefault();const data={id:editingGradeId||Date.now().toString(),subject:document.getElementById("grade-subject").value,name:document.getElementById("grade-name").value.trim(),grade:Number(document.getElementById("grade-value").value),weight:Number(document.getElementById("grade-weight").value),created:Date.now()};if(editingGradeId){const i=grades.findIndex(g=>g.id===editingGradeId);if(i>=0)grades[i]={...grades[i],...data}}else grades.push(data);saveData();closeGradeModal();showPage("grades")});

function setActive(page){navButtons.forEach(b=>b.classList.toggle("active",b.dataset.page===page))}
function showPage(page){setActive(page);if(page==="home")renderHome();else if(page==="calendar")renderCalendar();else if(page==="tasks")renderTasks();else if(page==="tests")renderTests();else if(page==="timetable")renderTimetable();else if(page==="grades")renderGrades()}
navButtons.forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

/* ========================= TIMETABLE ========================= */
function renderTimetable(){const names=["","Monday","Tuesday","Wednesday","Thursday","Friday"];let html="";for(let day=1;day<=5;day++){html+=`<section class="card" style="margin-bottom:20px"><h2>${names[day]}</h2><p class="card-subtitle">Your regular timetable</p><div class="schedule">${timetable[day].map((s,i)=>{const t=times[i+1];return `<div class="schedule-row"><div class="schedule-time">${t[1]}–${t[2]}</div><div class="schedule-subject ${s==="Free"?"free":""}">${escapeHTML(s)}</div></div>`}).join("")}</div></section>`}appContent.innerHTML=html}

showPage("home");
