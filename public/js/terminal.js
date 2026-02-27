(function initTerminal(){
  const termOutput=document.getElementById('termOutput');
  const termInput=document.getElementById('termInput');
  const termWindow=document.getElementById('termWindow');
  const termAC=document.getElementById('termAutocomplete');
  const termUptime=document.getElementById('termUptime');
  const eggOverlay=document.getElementById('termEggOverlay');
  const eggEmoji=document.getElementById('termEggEmoji');
  const eggTitle=document.getElementById('termEggTitle');
  const eggBody=document.getElementById('termEggBody');
  const eggClose=document.getElementById('termEggClose');
  const matrixCanvas=document.getElementById('matrixCanvas');
  const emojiRainEl=document.getElementById('emojiRain');

  let history=[],histIdx=-1,startTime=Date.now(),matrixRAF=null,matrixActive=false;

  setInterval(()=>{const s=Math.floor((Date.now()-startTime)/1000);const m=Math.floor(s/60),sec=s%60;termUptime.textContent=m>0?`up ${m}m ${sec}s`:`up ${sec}s`;},1000);
  termInput.addEventListener('focus',()=>termWindow.classList.add('focused'));
  termInput.addEventListener('blur',()=>termWindow.classList.remove('focused'));
  termWindow.addEventListener('click',()=>termInput.focus());

  document.querySelectorAll('.hint-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{termInput.value=chip.dataset.cmd;termInput.focus();runCommand(chip.dataset.cmd.trim());termInput.value='';});
  });

  const COMMANDS={help:1,whoami:1,skills:1,projects:1,contact:1,coffee:1,sleep:1,clear:1,neofetch:1,matrix:1,party:1,konami:1,sudo:1,'rm -rf':1,ls:1,cd:1,cat:1,git:1,'hire me':1,joke:1,fact:1,ping:1,date:1,echo:1,pwd:1,yes:1,flip:1,dance:1,hug:1};
  const CMD_DESCS={help:'show all commands',whoami:'about wahyu',skills:'tech stack list',projects:'portfolio projects',contact:'get in touch',coffee:'fuel meter ☕',sleep:'wahyu needs rest',clear:'clear terminal',neofetch:'system info',matrix:'enter the matrix',party:'celebrate! 🎉',joke:'random dev joke',fact:'random fun fact',ping:'check connection',date:'current date/time',echo:'echo your text',flip:'(╯°□°）╯︵ ┻━┻',dance:'do a lil dance',hug:'virtual hug','hire me':'open to work info'};

  function printLine(text='',type='out',cls=''){
    const div=document.createElement('div');
    div.className=`term-line ${type} ${cls}`;
    if(type==='cmd')div.innerHTML=`<span class="term-prompt">❯</span><span class="term-text">${escHtml(text)}</span>`;
    else if(type!=='blank')div.innerHTML=`<span class="term-text">${text}</span>`;
    termOutput.appendChild(div);
    termOutput.scrollTop=termOutput.scrollHeight;
    return div;
  }
  function printAscii(text){const pre=document.createElement('pre');pre.className='term-ascii';pre.textContent=text;termOutput.appendChild(pre);termOutput.scrollTop=termOutput.scrollHeight;}
  function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  async function printLines(lines,delay=35){for(const[text,type,cls]of lines){await wait(delay);printLine(text,type,cls);}}
  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function shake(){termWindow.classList.remove('shaking');void termWindow.offsetWidth;termWindow.classList.add('shaking');setTimeout(()=>termWindow.classList.remove('shaking'),500);}

  async function printProgress(label,duration=1200){
    const wrap=document.createElement('div');wrap.className='term-progress-wrap';
    const uid=Date.now();
    wrap.innerHTML=`<span style="color:rgba(255,255,255,0.5);font-size:0.75rem;font-family:'JetBrains Mono',monospace;">${label} </span><div class="term-progress-bar"><div class="term-progress-fill" id="pf${uid}"></div></div><span style="color:var(--accent);font-size:0.72rem;font-family:'JetBrains Mono',monospace;" id="pp${uid}">0%</span>`;
    termOutput.appendChild(wrap);
    const fill=wrap.querySelector('.term-progress-fill');
    const pct=wrap.querySelector(`#pp${uid}`);
    const steps=30,step=duration/steps;
    for(let i=1;i<=steps;i++){await wait(step);const p=Math.round((i/steps)*100);fill.style.width=p+'%';pct.textContent=p+'%';termOutput.scrollTop=termOutput.scrollHeight;}
    await wait(100);pct.textContent='✓ done';pct.style.color='#4ade80';
  }

  async function runCommand(raw){
    const cmd=raw.trim().toLowerCase();
    const args=raw.trim().split(' ').slice(1).join(' ');
    if(raw.trim()){history.unshift(raw.trim());if(history.length>50)history.pop();}
    histIdx=-1;
    printLine(raw,'cmd');printLine('','blank');
    if(!cmd)return;

    switch(true){
      case cmd==='help':{
        printAscii(`  ╔═══════════════════════════════════════╗\n  ║   wahyu@portfolio — command list      ║\n  ╚═══════════════════════════════════════╝`);
        const cats=[{label:'// info',cmds:['whoami','neofetch','skills','projects','contact']},{label:'// fun',cmds:['coffee','sleep','party','dance','hug','flip','joke','fact']},{label:'// system',cmds:['clear','ls','pwd','date','ping','echo [text]']},{label:'// secret',cmds:['matrix','sudo','konami','hire me','yes','cat secret.txt']}];
        for(const cat of cats){await wait(40);printLine(`<span style="color:var(--accent);opacity:0.6">${cat.label}</span>`,'out');for(const c of cat.cmds){await wait(25);const base=c.split(' ')[0];const desc=CMD_DESCS[c]||CMD_DESCS[base]||'';printLine(`  <span style="color:var(--accent);min-width:120px;display:inline-block">${c}</span><span style="color:rgba(255,255,255,0.3)">— ${desc}</span>`,'out');}printLine('','blank');}
        printLine('<span style="color:rgba(255,255,255,0.25)">tip: click the chips above ↑ or use Tab for autocomplete</span>','out');
        break;}

      case cmd==='whoami':{
        printAscii(` __      __ _ _\n \\ \\    / /| | |\n  \\ \\  / / | | |  __ _   _   _\n   \\ \\/ /  | | | / _\` | | | | |\n    \\  /   | | || (_| | | |_| |\n     \\/    |_|_| \\__,_|  \\__, |\n                           __/ |\n   Muhammad Wahyu Nurdin  |___/`);
        await printLines([['','blank'],['<span style="color:var(--accent)">●</span> Name    <span style="color:rgba(255,255,255,0.7)">Muhammad Wahyu Nurdin</span>','out'],['<span style="color:var(--accent)">●</span> Alias   <span style="color:var(--accent2)">whoayou</span>','out'],['<span style="color:var(--accent)">●</span> Role    <span style="color:rgba(255,255,255,0.7)">Web Developer 🚀</span>','out'],['<span style="color:var(--accent)">●</span> City    <span style="color:rgba(255,255,255,0.7)">Gorontalo, Indonesia 🌴</span>','out'],['<span style="color:var(--accent)">●</span> Status  <span style="color:#4ade80">● Available for projects</span>','out'],['<span style="color:var(--accent)">●</span> Vibe    <span style="color:rgba(255,255,255,0.7)">coffee ☕  +  code 💻  +  game 🎮</span>','out'],['','blank'],['<span style="color:rgba(255,255,255,0.3)">run <span style="color:var(--accent)">contact</span> to reach me!</span>','out']]);
        break;}

      case cmd==='neofetch':{
        const osl=['<span style="color:var(--accent)">         .-.         </span>  <span style="color:var(--accent)">wahyu</span><span style="color:rgba(255,255,255,0.4)">@</span><span style="color:var(--accent2)">portfolio</span>','<span style="color:var(--accent)">        (o o)        </span>  <span style="color:rgba(255,255,255,0.3)">──────────────────</span>','<span style="color:var(--accent)">       /|=H=|\\       </span>  <span style="color:var(--accent)">OS</span>      <span style="color:rgba(255,255,255,0.6)">Ubuntu 24.04 LTS</span>','<span style="color:var(--accent)">      / |   | \\      </span>  <span style="color:var(--accent)">Shell</span>   <span style="color:rgba(255,255,255,0.6)">bash 5.2</span>','<span style="color:var(--accent)">     /  |   |  \\     </span>  <span style="color:var(--accent)">IDE</span>     <span style="color:rgba(255,255,255,0.6)">VS Code + Neovim</span>','<span style="color:var(--accent)">        |   |        </span>  <span style="color:var(--accent)">Stack</span>   <span style="color:rgba(255,255,255,0.6)">React · Laravel · Tailwind</span>','<span style="color:var(--accent)">        |   |        </span>  <span style="color:var(--accent)">Coffee</span>  <span style="color:rgba(255,255,255,0.6)">∞ cups/day</span>','<span style="color:var(--accent)">       (_) (_)       </span>  <span style="color:var(--accent)">Mood</span>    <span style="color:#4ade80">●</span> <span style="color:rgba(255,255,255,0.6)">vibing</span>','','<span style="color:var(--accent)">                     </span>  <span style="background:#ff5f57;color:#ff5f57">██</span><span style="background:#febc2e;color:#febc2e">██</span><span style="background:#28c840;color:#28c840">██</span><span style="background:#00f5d4;color:#00f5d4">██</span><span style="background:#7c3aed;color:#7c3aed">██</span><span style="background:#f72585;color:#f72585">██</span>'];
        printLine('','blank');for(const l of osl){await wait(40);printLine(l,'out');}printLine('','blank');
        break;}

      case cmd==='skills':{
        const sk=[['Laravel',100,'#f72585'],['Tailwind CSS',92,'#38bdf8'],['PHP',90,'#c792ea'],['React',80,'#61dafb'],['MySQL',75,'#4ade80'],['Bootstrap',70,'#7c3aed'],['Node.js',50,'#84cc16']];
        printLine('<span style="color:var(--accent)">// tech stack</span>','out');printLine('','blank');
        for(const[name,pct,color]of sk){await wait(60);const f=Math.round(pct/5);const bar='█'.repeat(f)+'░'.repeat(20-f);printLine(`  <span style="min-width:130px;display:inline-block;color:rgba(255,255,255,0.7)">${name}</span><span style="color:${color};letter-spacing:1px">${bar}</span> <span style="color:rgba(255,255,255,0.3)">${pct}%</span>`,'out');}
        printLine('','blank');printLine('<span style="color:rgba(255,255,255,0.3)">// always learning something new 📚</span>','out');
        break;}

      case cmd==='projects':{
        printLine('<span style="color:var(--accent)">// projects</span>','out');printLine('','blank');
        const projs=[{name:'mokaraja.net',desc:"Freelance web projects",stack:'Laravel · MySQL',status:'🟢 live'},{name:'Portfolio v3',desc:"This site you're on!",stack:'HTML · CSS · JS',status:'🟢 live'},{name:'Coming soon…',desc:'Next big project',stack:'???',status:'🟡 building'}];
        for(const p of projs){await wait(80);printLine(`  <span style="color:var(--accent);font-weight:700">${p.name}</span> <span style="color:rgba(255,255,255,0.25)">—</span> <span style="color:rgba(255,255,255,0.5)">${p.desc}</span>`,'out');printLine(`  <span style="color:rgba(255,255,255,0.3)">stack:</span> <span style="color:var(--accent2)">${p.stack}</span>  <span style="color:rgba(255,255,255,0.3)">status:</span> <span style="color:rgba(255,255,255,0.6)">${p.status}</span>`,'out');printLine('','blank');}
        break;}

      case cmd==='contact':{
        await printLines([['<span style="color:var(--accent)">// let\'s connect!</span>','out'],['','blank'],['  📱  <span style="color:rgba(255,255,255,0.7)">WhatsApp</span>  <span style="color:var(--accent2)">+62 895-7042-20904</span>','out'],['  🐙  <span style="color:rgba(255,255,255,0.7)">GitHub</span>    <span style="color:var(--accent2)">github.com/wayouKz</span>','out'],['  📸  <span style="color:rgba(255,255,255,0.7)">Instagram</span> <span style="color:var(--accent2)">@mhmddwahyu_</span>','out'],['  🎵  <span style="color:rgba(255,255,255,0.7)">TikTok</span>    <span style="color:var(--accent2)">@anaktunggalmamapapa</span>','out'],['','blank'],['<span style="color:rgba(255,255,255,0.3)">scroll down to the contact section 👇</span>','out']]);
        break;}

      case cmd==='coffee':{
        const hour=new Date().getHours();const isNight=hour>=21||hour<6;
        printLine('<span style="color:var(--accent)">// checking fuel levels...</span>','out');
        await printProgress('brewing...',1000);await wait(200);printLine('','blank');
        if(isNight){printLine('  <span style="font-size:1.2em">☕☕☕</span>  CRITICAL LEVELS — IT\'S PAST 9PM','out','warn');printLine('  <span style="color:rgba(255,255,255,0.5)">wahyu is probably coding and caffeinating right now</span>','out');}
        else{const cups=Math.floor(Math.random()*3)+1;const bar='☕'.repeat(cups)+'🫙'.repeat(4-cups);printLine(`  ${bar}  Today: ${cups}/4 cups`,'out','success');printLine('  <span style="color:rgba(255,255,255,0.5)">fuel level: nominal — productive session ahead</span>','out');}
        printLine('','blank');printLine('<span style="color:rgba(255,255,255,0.3)">kopi hitam, no sugar. always.</span>','out');
        break;}

      case cmd==='sleep':{
        printLine('<span style="color:var(--accent)">// checking wahyu\'s sleep schedule...</span>','out');await wait(400);
        await printLines([['','blank'],['  😴 Last sleep: <span style="color:#f87171">2:47 AM</span> (yesterday)','out'],['  ⏰ Wake up:    <span style="color:#fbbf24">7:30 AM</span> (too early)','out'],['  🧠 Brain:     <span style="color:#4ade80">surprisingly functional</span>','out'],['','blank'],['<span style="color:rgba(255,255,255,0.3)">// powered by coffee, not sleep</span>','out']]);
        break;}

      case cmd==='joke':{
        const jokes=[['Why do programmers prefer dark mode?','Because light attracts bugs! 🐛'],['How do you comfort a JavaScript bug?','You console it. 😂'],['Why did the developer quit?',"Because they didn't get arrays. 💀"],['What\'s a programmer\'s favorite snack?','Microchips! 🍟'],['Why do Java developers wear glasses?','Because they don\'t C#! 👓'],['A SQL query walks into a bar...','...walks up to two tables and asks: "Can I JOIN you?" 🍺']];
        const[setup,punchline]=jokes[Math.floor(Math.random()*jokes.length)];
        printLine(`  🎤 ${setup}`,'out');await wait(900);printLine(`  <span style="color:#fbbf24">→ ${punchline}</span>`,'out','warn');printLine('','blank');printLine('<span style="color:rgba(255,255,255,0.3)">type <span style="color:var(--accent)">joke</span> again for another one</span>','out');
        break;}

      case cmd==='fact':{
        const facts=['The first computer bug was an actual bug — a moth found inside a Harvard Mark II in 1947. 🦗','JavaScript was created in just 10 days by Brendan Eich in 1995. 😱','"Bug" in code was popularized by Grace Hopper after literally finding a moth in a relay. 🐛','The average web page in 2024 is over 2.5MB — heavier than Doom (1993). 🎮','PHP originally stood for "Personal Home Page". Now: "PHP: Hypertext Preprocessor". 🔄','Stack Overflow was founded in 2008. Before that, devs figured things out alone. 😰'];
        const fact=facts[Math.floor(Math.random()*facts.length)];
        printLine('<span style="color:var(--accent)">// random dev fact</span>','out');await wait(300);printLine(`  💡 ${fact}`,'out');printLine('','blank');printLine('<span style="color:rgba(255,255,255,0.3)">type <span style="color:var(--accent)">fact</span> again for another</span>','out');
        break;}

      case cmd==='hire me':{
        printAscii(`  ██╗  ██╗██╗██████╗ ███████╗    ███╗   ███╗███████╗\n  ██║  ██║██║██╔══██╗██╔════╝    ████╗ ████║██╔════╝\n  ███████║██║██████╔╝█████╗      ██╔████╔██║█████╗  \n  ██╔══██║██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝  \n  ██║  ██║██║██║  ██║███████╗    ██║ ╚═╝ ██║███████╗\n  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝     ╚═╝╚══════╝`);
        await printLines([['','blank'],['  ✅  <span style="color:#4ade80">Open for freelance projects</span>','out'],['  ✅  <span style="color:#4ade80">Available for part-time work</span>','out'],['  ✅  <span style="color:#4ade80">Open to full-time opportunities</span>','out'],['','blank'],['  💼  Stack: <span style="color:var(--accent2)">React · Laravel · Tailwind · PHP · MySQL</span>','out'],['  📍  Location: <span style="color:rgba(255,255,255,0.6)">Gorontalo, Indonesia 🌴 (remote ok!)</span>','out'],['  💬  Contact: <span style="color:var(--accent)">wa.me/+62895704220904</span>','out'],['','blank'],['<span style="color:#fbbf24">⚡ Response time: usually < 24 hours</span>','out','warn']]);
        showEgg('🚀','Let\'s Build Something!','Kamu baru buka "hire me" command — berarti kamu serius nih! 😄\n\nWahyu available buat project kamu.\nHubungi lewat WhatsApp yuk!',true);
        break;}

      case cmd==='party':{
        printLine('<span style="color:var(--accent)">// 🎉 PARTY MODE ACTIVATED</span>','out');await wait(200);
        const d=document.createElement('div');d.className='term-line out';d.style.paddingLeft='1.2rem';termOutput.appendChild(d);
        for(const ch of '🎉🎊🎈🥳🎆🎇✨🎉🎊🎈🥳🎆'.split('')){await wait(60);const sp=document.createElement('span');sp.className='term-confetti-char';sp.textContent=ch;sp.style.animationDelay=Math.random()*0.3+'s';d.appendChild(sp);termOutput.scrollTop=termOutput.scrollHeight;}
        await wait(400);printLine('','blank');printLine('  <span style="color:rgba(255,255,255,0.5)">wahyu is doing the coding dance rn 🕺</span>','out');
        emojiRainBurst(['🎉','🎊','🎈','🥳','⭐','✨','💫','🎆'],30);
        break;}

      case cmd==='dance':{
        for(const f of['  ┌(★ω★)┘  wahyu go brr','  └(★ω★)┐  ','  ┌(★ω★)┘  wahyu go brr','  └(★ω★)┐  ','  ヽ(✿ﾟ▽ﾟ)ノ  done 💃']){await wait(220);printLine(`<span style="color:var(--accent)">${f}</span>`,'out');}
        break;}

      case cmd==='hug':{
        await printLines([['','blank'],['  <span style="color:#f472b6">( っ◔◡◔)っ  ♥  virtual hug for you!</span>','out'],['','blank'],['  <span style="color:rgba(255,255,255,0.4)">thanks for visiting wahyu\'s portfolio 🤍</span>','out']]);
        emojiRainBurst(['🤍','💚','💙','💜','🩷','✨'],15);
        break;}

      case cmd==='flip':{
        await printLines([['  (╯°□°）╯︵ ┻━┻','out','error'],['','blank'],['  <span style="color:rgba(255,255,255,0.4)">wahyu when npm install fails for the 5th time</span>','out']]);
        shake();break;}

      case cmd==='matrix':{
        printLine('<span style="color:#4ade80">// initiating matrix protocol...</span>','out','success');await wait(600);
        printLine('<span style="color:rgba(255,255,255,0.3)">// click anywhere to exit</span>','out');await wait(400);startMatrix();
        break;}

      case cmd.startsWith('sudo'):{
        await wait(300);printLine('  [sudo] password for wahyu: ','out');await wait(800);printLine('  <span style="color:#f87171">wahyu is not in the sudoers file.</span>','out','error');printLine('  <span style="color:#fbbf24">This incident will be reported. 👀</span>','out','warn');shake();
        break;}

      case cmd.startsWith('rm'):{
        await wait(200);printLine('  <span style="color:#f87171">⚠️  Permission denied!</span>','out','error');printLine('  <span style="color:rgba(255,255,255,0.4)">Nice try though 😂</span>','out');shake();
        break;}

      case cmd==='ls'||cmd==='ls -la':{
        await printLines([['','blank'],['  <span style="color:var(--accent2)">drwxr-xr-x</span>  <span style="color:rgba(255,255,255,0.6)">./skills</span>','out'],['  <span style="color:var(--accent2)">drwxr-xr-x</span>  <span style="color:rgba(255,255,255,0.6)">./projects</span>','out'],['  <span style="color:var(--accent2)">drwxr-xr-x</span>  <span style="color:rgba(255,255,255,0.6)">./experience</span>','out'],['  <span style="color:var(--accent)">-rw-r--r--</span>  <span style="color:rgba(255,255,255,0.6)">about.json</span>','out'],['  <span style="color:var(--accent)">-rw-r--r--</span>  <span style="color:rgba(255,255,255,0.6)">contact.md</span>','out'],['  <span style="color:#f72585">-rw-------</span>  <span style="color:rgba(255,255,255,0.6)">secret.txt</span>','out'],['','blank']]);
        break;}

      case cmd==='pwd':{printLine('  /home/wahyu/portfolio','out');break;}
      case cmd==='date':{printLine(`  ${new Date().toLocaleString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})}`,'out');break;}
      case cmd.startsWith('echo'):{printLine(`  ${args||'(nothing to echo...)'}`,'out');break;}

      case cmd==='ping':{
        await printLines([['  PING portfolio.wahyu.dev','out'],['','blank']]);
        for(let i=1;i<=4;i++){await wait(300);const ms=Math.floor(Math.random()*8+1);printLine(`  64 bytes from wahyu: icmp_seq=${i} ttl=64 time=<span style="color:#4ade80">${ms}ms</span>`,'out');}
        await wait(200);printLine('','blank');printLine('  <span style="color:#4ade80">✓ portfolio is live and healthy!</span>','out','success');
        break;}

      case cmd==='cat secret.txt':{
        showEgg('🔐','command line tersembunyi','Wahyu see you found the secret file! 👀\n\nHere\'s a little surprise for you:\n\n"the most special person in the world is named Miranda 💕"');
        break;}

      case cmd.startsWith('cd'):{
        const dir=args||'~';
        if(dir==='..'){printLine('  <span style="color:rgba(255,255,255,0.4)">you are already at the top 🙃</span>','out');}
        else{printLine(`  <span style="color:rgba(255,255,255,0.4)">cd: ${dir}: No such directory (try <span style="color:var(--accent)">ls</span>)</span>`,'out');}
        break;}

      case cmd==='yes':{
        printLine('<span style="color:#fbbf24">⚠ warning: don\'t do this on a real terminal</span>','out','warn');
        for(let i=0;i<8;i++){await wait(80);printLine('y','out');}
        await wait(100);printLine('<span style="color:rgba(255,255,255,0.3)">...ok you get the idea</span>','out');
        break;}

      case cmd==='konami':{
        printLine('<span style="color:rgba(255,255,255,0.3)">// hint: ↑↑↓↓←→←→BA</span>','out');
        printLine('<span style="color:rgba(255,255,255,0.25)">// try it on the keyboard 👀</span>','out');
        break;}

      case cmd.startsWith('git'):{
        const gitMap={'git status':'  On branch main — nothing to commit ✅','git log':'  <span style="color:#f72585">commit abc1234</span> — feat: add terminal easter egg\n  <span style="color:#f72585">commit def5678</span> — feat: add parallax system','git push':'  <span style="color:#4ade80">✓ pushed to origin/main</span>'};
        const out=gitMap[cmd];
        if(out){for(const l of out.split('\n'))printLine(l,'out');}
        else{printLine(`  git: '${args}' not found. did you mean: <span style="color:var(--accent)">commit</span>?`,'out','warn');}
        break;}

      case cmd==='special_person':{
        printLine('<span style="color:#f472b6">// accessing classified file...</span>','out');
        await printProgress('decrypting 💖',1200);
        await wait(300);
        printAscii(`  ███╗   ███╗██╗██████╗  █████╗ ███╗   ██╗██████╗  █████╗ \n  ████╗ ████║██║██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔══██╗\n  ██╔████╔██║██║██████╔╝███████║██╔██╗ ██║██║  ██║███████║\n  ██║╚██╔╝██║██║██╔══██╗██╔══██║██║╚██╗██║██║  ██║██╔══██║\n  ██║ ╚═╝ ██║██║██║  ██║██║  ██║██║ ╚████║██████╔╝██║  ██║\n  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝`);
        await wait(200);
        await printLines([
          ['','blank'],
          ['  🩷  <span style="color:#f472b6;letter-spacing:0.05em">The most special person in the world</span>','out'],
          ['','blank'],
          ['  <span style="color:rgba(255,255,255,0.4)">Name     :</span>  <span style="color:#f472b6;font-weight:700">Miranda 💕</span>','out'],
          ['  <span style="color:rgba(255,255,255,0.4)">Status   :</span>  <span style="color:#4ade80">● very special</span>','out'],
          ['  <span style="color:rgba(255,255,255,0.4)">Threat   :</span>  <span style="color:#fbbf24">bikin wahyu senyum sendiri</span>','out'],
          ['  <span style="color:rgba(255,255,255,0.4)">Effect   :</span>  <span style="color:#f472b6">heart.exe has stopped working 💘</span>','out'],
          ['','blank'],
          ['  <span style="color:rgba(255,255,255,0.25)">// this file is top secret. you found it. 🤫</span>','out'],
        ]);
        mirandaRain();
        showEgg('🩷','Miranda 💕','Hihihi Kamu Nemuinf .\n\nKalau kamu lagi baca ini,\nhiiii miranda 👋🥰\n\n— wahyu');
        break;}

      case cmd==='clear'||cmd==='cls':{termOutput.innerHTML='';printWelcome();return;}

      default:{
        printLine(`  <span style="color:#f87171">command not found: ${escHtml(cmd)}</span>`,'out','error');
        printLine(`  <span style="color:rgba(255,255,255,0.3)">type <span style="color:var(--accent)">help</span> to see available commands</span>`,'out');
      }
    }
    printLine('','blank');termOutput.scrollTop=termOutput.scrollHeight;
  }

  async function printWelcome(){
    await printLines([
      ['<span style="color:var(--accent)">  ██╗    ██╗  █████╗  ██╗  ██╗██╗   ██╗ ██╗   ██╗</span>','out'],
      ['<span style="color:var(--accent)">  ██║    ██║ ██╔══██ ╗██║  ██║╚██╗ ██╔╝ ██║   ██║</span>','out'],
      ['<span style="color:var(--accent)">  ██║ █╗ ██║ ███████║ ███████║ ╚████╔╝  ██║   ██║</span>','out'],
      ['<span style="color:var(--accent2)">  ██║███╗██║██╔══██║ ██╔══██║  ╚██╔╝   ██║   ██║</span>','out'],
      ['<span style="color:var(--accent2)">  ╚███╔███╔╝██║  ██║ ██║  ██║   ██║    ╚██████╔╝</span>','out'],
      ['<span style="color:var(--accent2)">   ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝   ╚═╝     ╚═════╝ </span>','out'],
      ['','blank'],
      ['  <span style="color:rgba(255,255,255,0.6)">Welcome to</span> <span style="color:var(--accent)">wahyu\'s interactive terminal</span> <span style="color:rgba(255,255,255,0.3)">v3.0.0</span>','out'],
      ['  <span style="color:rgba(255,255,255,0.3)">Type</span> <span style="color:var(--accent)">help</span> <span style="color:rgba(255,255,255,0.3)">for available commands. Tab for autocomplete.</span>','out'],
      ['','blank'],
    ],18);
  }

  termInput.addEventListener('keydown',async(e)=>{
    if(e.key==='Enter'){const val=termInput.value;termInput.value='';hideAC();if(!val.trim())return;await runCommand(val);}
    else if(e.key==='ArrowUp'){e.preventDefault();histIdx=Math.min(histIdx+1,history.length-1);termInput.value=history[histIdx]||'';}
    else if(e.key==='ArrowDown'){e.preventDefault();histIdx=Math.max(histIdx-1,-1);termInput.value=histIdx===-1?'':history[histIdx];}
    else if(e.key==='Tab'){e.preventDefault();const match=Object.keys(COMMANDS).find(c=>c.startsWith(termInput.value.toLowerCase())&&c!==termInput.value.toLowerCase());if(match)termInput.value=match;hideAC();}
    else if(e.key==='Escape'){hideAC();}
  });

  termInput.addEventListener('input',()=>{
    const val=termInput.value.trim().toLowerCase();if(!val){hideAC();return;}
    const matches=Object.entries(CMD_DESCS).filter(([cmd])=>cmd.startsWith(val)&&cmd!==val);
    if(!matches.length){hideAC();return;}
    termAC.innerHTML='';
    matches.slice(0,6).forEach(([cmd,desc])=>{
      const item=document.createElement('div');item.className='term-ac-item';
      item.innerHTML=`<span class="ac-cmd">${cmd}</span><span class="ac-desc">${desc}</span>`;
      item.addEventListener('mousedown',(e)=>{e.preventDefault();termInput.value=cmd;hideAC();termInput.focus();});
      termAC.appendChild(item);
    });
    termAC.classList.add('show');
  });
  function hideAC(){termAC.classList.remove('show');termAC.innerHTML='';}

  function showEgg(emoji,title,body,isHireMe=false){
    eggEmoji.textContent=emoji;eggTitle.textContent=title;eggBody.innerHTML=body.replace(/\n/g,'<br>');
    if(isHireMe)eggBody.innerHTML+=`<br><br><a href="https://wa.me/+62895704220904" style="color:var(--accent);text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:0.75rem;border:1px solid rgba(0,245,212,0.3);padding:0.4rem 1rem;border-radius:4px;display:inline-block;margin-top:0.5rem;transition:all 0.2s" onmouseover="this.style.background='rgba(0,245,212,0.1)'" onmouseout="this.style.background='transparent'">📱 Open WhatsApp</a>`;
    eggOverlay.classList.add('active');
  }
  eggClose.addEventListener('click',()=>eggOverlay.classList.remove('active'));
  eggOverlay.addEventListener('click',(e)=>{if(e.target===eggOverlay)eggOverlay.classList.remove('active');});

  function emojiRainBurst(emojis,count){
    for(let i=0;i<count;i++){setTimeout(()=>{const el=document.createElement('div');el.className='rain-emoji';el.textContent=emojis[Math.floor(Math.random()*emojis.length)];el.style.left=Math.random()*100+'vw';el.style.animationDuration=(1.5+Math.random()*2)+'s';el.style.fontSize=(1+Math.random()*1.5)+'rem';emojiRainEl.appendChild(el);setTimeout(()=>el.remove(),4000);},i*60);}
  }

  function mirandaRain(){
    const texts=['Miranda','miranda','ミランダ','💕','🩷','miranda 💕','M I R A N D A','♡ miranda','miranda ♡'];
    const colors=['#f472b6','#fb7185','#f9a8d4','#e879f9','#c084fc','#f0abfc','#fda4af'];
    for(let i=0;i<60;i++){
      setTimeout(()=>{
        const el=document.createElement('div');
        el.style.cssText=`position:fixed;top:-40px;left:${Math.random()*100}vw;font-family:'JetBrains Mono',monospace;font-size:${0.65+Math.random()*0.9}rem;color:${colors[Math.floor(Math.random()*colors.length)]};pointer-events:none;z-index:9997;white-space:nowrap;animation:rainFall ${1.8+Math.random()*2.5}s linear forwards;opacity:${0.5+Math.random()*0.5};text-shadow:0 0 8px rgba(244,114,182,0.6);`;
        el.textContent=texts[Math.floor(Math.random()*texts.length)];
        document.body.appendChild(el);
        setTimeout(()=>el.remove(),5000);
      },i*80);
    }
  }

  function startMatrix(){
    if(matrixActive)return;matrixActive=true;matrixCanvas.classList.add('active');
    const ctx=matrixCanvas.getContext('2d');matrixCanvas.width=window.innerWidth;matrixCanvas.height=window.innerHeight;
    const cols=Math.floor(matrixCanvas.width/14);const drops=Array(cols).fill(1);
    const chars='アイウエオカキクケコサシスセソ0123456789ABCDEF</>{}[]';
    function draw(){ctx.fillStyle='rgba(0,0,0,0.04)';ctx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);drops.forEach((y,i)=>{const ch=chars[Math.floor(Math.random()*chars.length)];ctx.fillStyle=Math.random()>0.95?'#fff':'rgba(0,245,212,0.8)';ctx.font='13px JetBrains Mono,monospace';ctx.fillText(ch,i*14,y*14);if(y*14>matrixCanvas.height&&Math.random()>0.975)drops[i]=0;drops[i]++;});matrixRAF=requestAnimationFrame(draw);}
    draw();
    const exitMatrix=()=>{matrixActive=false;matrixCanvas.classList.remove('active');cancelAnimationFrame(matrixRAF);const c2=matrixCanvas.getContext('2d');c2.clearRect(0,0,matrixCanvas.width,matrixCanvas.height);matrixCanvas.removeEventListener('click',exitMatrix);printLine('<span style="color:#4ade80">// you escaped the matrix. welcome back, neo. 😎</span>','out','success');printLine('','blank');};
    matrixCanvas.addEventListener('click',exitMatrix);
  }

  // Konami code
  const KONAMI=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx=0;
  document.addEventListener('keydown',(e)=>{
    if(e.key===KONAMI[konamiIdx]){konamiIdx++;if(konamiIdx===KONAMI.length){konamiIdx=0;emojiRainBurst(['⭐','🌟','✨','💫','🎉','🎊','🥳','🎆','🎇'],50);showEgg('🕹️','KONAMI CODE!','↑↑↓↓←→←→BA\n\nYOU FOUND THE KONAMI CODE!\n\n+30 Lives added to your portfolio.\nWahyu would be very impressed. 😤');printLine('<span style="color:#fbbf24">⭐ KONAMI CODE ACTIVATED! 🕹️</span>','out','warn');}}else{konamiIdx=0;}
  });

  printWelcome();
  setTimeout(()=>termInput.focus(),500);
})();