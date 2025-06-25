# === FUN COMMANDS (zsh-native, robust) ===
magic8ball() {
  local responses=(
    "It is certain." "It is decidedly so." "Without a doubt." "Yes definitely."
    "You may rely on it." "As I see it, yes." "Most likely." "Outlook good."
    "Yes." "Signs point to yes." "Reply hazy, try again." "Ask again later."
    "Better not tell you now." "Cannot predict now." "Concentrate and ask again."
    "Don't count on it." "My reply is no." "My sources say no."
    "Outlook not so good." "Very doubtful."
  )
  local idx=$((RANDOM % ${#responses[@]}))
  echo "${responses[$idx]} 🔮"
}

coinflip() {
  if (( RANDOM % 2 )); then
    echo "Tails 🪙"
  else
    echo "Heads 🪙"
  fi
}

roll() {
  if [[ ! $1 =~ ^([0-9]*)d([0-9]+)([+-][0-9]+)?$ ]]; then
    echo "Usage: roll <NdM+K> (e.g., roll 3d6, roll d20+5)"
    return 1
  fi
  local n m k total=0 rolls=()
  if [[ $1 =~ ^([0-9]*)d([0-9]+)([+-][0-9]+)?$ ]]; then
    n="${match[1]:-1}"
    m="${match[2]}"
    k="${match[3]:-0}"
  fi
  for ((i=1; i<=n; i++)); do
    local r=$(( (RANDOM % m) + 1 ))
    rolls+=($r)
    (( total += r ))
  done
  (( total += k ))
  echo "Rolled: ${rolls[*]} $([[ $k != 0 ]] && echo "$k") → $total 🎲"
}

# === ULTIMATE ZSH COMMAND CHEATSHEET ===
halp!() {
  echo "🚀 ULTIMATE ZSH COMMAND CHEATSHEET 🚀"
  echo "=================================================="
  echo ""
  echo "🔥 QUICK ACTIONS:"
  echo "  zap              - Reload .zshrc with style"
  echo "  sstdev           - Start SST dev (filters out heartbeat noise)"
  echo "  pdev             - Start pnpm dev"
  echo ""
  echo "🥷 GIT NINJA MOVES:"
  echo "  stash            - Stash changes like a ninja"
  echo "  yeet             - Push code to origin"
  echo "  addall           - Stage all changes"
  echo "  look             - Check git status"
  echo "  switch           - Switch to branch"
  echo "  commit <msg>     - Commit with message"
  echo "  rename <name>    - Rename current branch"
  echo "  oops             - Amend last commit (no edit)"
  echo "  nuke             - Nuclear reset (hard reset + clean)"
  echo "  timemachine      - Pretty git log graph"
  echo "  whoami           - Show git user info"
  echo "  newbranch <name> - Create and switch to new branch"
  echo "  killbranch <name>- Delete branch"
  echo ""
  echo "🚨 EMERGENCY COMMANDS:"
  echo "  panic            - Stash everything and go to main"
  echo "  unfuck           - Show reflog to recover from mistakes"
  echo ""
  echo "⚡ DEVELOPMENT HELPERS:"
  echo "  ports            - Show processes on common dev ports"
  echo "  killnode         - Kill all Node processes"
  echo "  cleannode        - Remove node_modules & package-lock"
  echo "  freshstart       - Clean install from scratch"
  echo "  findportz        - Find processes on ports 3000-3050"
  echo "  devports         - Show what's running on ports 3000-3010"
  echo "  killdevports     - Kill everything on ports 3000-3009"
  echo "  killport <num>   - Kill specific port"
  echo "  genocide         - Nuclear cleanup of all dev processes 💀"
  echo "  exterminate      - Exterminate all dev processes (alias)"
  echo "  apocalypse       - End times for stuck processes (alias)"
  echo ""
  echo "🐳 DOCKER SHORTCUTS:"
  echo "  dockernuke       - Nuclear docker cleanup"
  echo "  dockerps         - Pretty docker ps"
  echo ""
  echo "💻 SYSTEM UTILITIES:"
  echo "  diskspace        - Show disk usage"
  echo "  memcheck         - Show memory usage"
  echo "  cpucheck         - Show CPU usage"
  echo "  spy              - Watch CPU usage like a spy 🕵️"
  echo "  bigbrain         - Monitor memory hogs 🧠"
  echo "  whodis           - Who's hogging the CPU?"
  echo "  memhogs          - Memory gluttons exposed!"
  echo "  netspy           - Monitor network traffic 📡"
  echo "  bandwidth        - Watch bandwidth usage"
  echo "  systemz          - Full system dashboard 📊"
  echo ""
  echo "🎲 FUN STUFF:"
  echo "  weather          - Show current weather"
  echo "  myip             - Show your public IP"
  echo "  speedtest        - Run internet speed test"
  echo "  coinflip         - Flip a coin"
  echo "  magic8ball       - Ask the magic 8-ball"
  echo "  roll <dice>      - Roll dice (e.g., roll 3d6, roll d20+5)"
  echo ""
  echo "💡 Pro tip: Most commands have emoji feedback for maximum vibes! ✨"
  echo "=================================================="
} 