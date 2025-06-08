import { useState, useEffect, useRef } from 'react'
import './Terminal.css'
import descriptions from '../data/texts'

const buttons = {
  en: [
    { label: 'About', cmds: ['cat about.txt'] },
    { label: 'Skills', cmds: ['cat /skills/soft.txt', 'cat /skills/hard.txt'] },
    { label: 'Projects', cmds: ['cat /projects/school-api.txt', 'cat /projects/booking-system.txt'] },
    { label: 'Contact', cmds: ['cat contact.txt'] },
  ],
  pt: [
    { label: 'Sobre', cmds: ['cat sobre.txt'] },
    { label: 'Habilidades', cmds: ['cat /habilidades/pessoal.txt', 'cat /habilidades/tecnico.txt'] },
    { label: 'Projetos', cmds: ['cat /projetos/api-escolar.txt', 'cat /projetos/sistema-reservas.txt'] },
    { label: 'Contato', cmds: ['cat contato.txt'] },
  ],
}

const fs = {
  en: {
    '/': ['skills', 'projects', 'about.txt', 'contact.txt'],
    '/projects': ['school-api.txt', 'booking-system.txt'],
    '/skills': ['soft.txt', 'hard.txt'],
    'about.txt': descriptions.en.about,
    'contact.txt': descriptions.en.contact,
    '/skills/soft.txt': descriptions.en.skillsSoft,
    '/skills/hard.txt': descriptions.en.skillsHard,
    '/projects/school-api.txt': descriptions.en.schoolApi,
    '/projects/booking-system.txt': descriptions.en.bookingSystem,
  },
  pt: {
    '/': ['sobre.txt', 'habilidades', 'projetos', 'contato.txt'],
    '/projetos': ['api-escolar.txt', 'sistema-reservas.txt'],
    '/habilidades': ['pessoal.txt', 'tecnico.txt'],
    'sobre.txt': descriptions.pt.about,
    'contato.txt': descriptions.pt.contact,
    '/habilidades/pessoal.txt': descriptions.pt.skillsSoft,
    '/habilidades/tecnico.txt': descriptions.pt.skillsHard,
    '/projetos/api-escolar.txt': descriptions.pt.schoolApi,
    '/projetos/sistema-reservas.txt': descriptions.pt.bookingSystem,
  }
}

export default function Terminal() {
  const [lang, setLang] = useState('en')
  const [cwd, setCwd] = useState('/')
  const [output, setOutput] = useState([])
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const print = (text = '') => setOutput((o) => [...o, text])

  const clear = () => setOutput([])

  const handleCommand = (cmd) => {
    const parts = cmd.trim().split(' ')
    const base = parts[0]
    const args = parts.slice(1)
    const currentFS = fs[lang]

    switch (base) {
      case 'ls':
        print((currentFS[cwd] || []).join('\n'))
        break
      case 'cd':
        if (args.length === 0) {
          setCwd('/')
        } else if (args[0] === '..') {
          if (cwd !== '/') {
            const p = cwd.split('/')
            p.pop()
            const newPath = p.length === 1 ? '/' : p.join('/')
            setCwd(newPath)
          }
        } else if (args[0] !== '.') {
          const target = cwd === '/' ? `/${args[0]}` : `${cwd}/${args[0]}`
          if (currentFS[target]) {
            setCwd(target)
          } else {
            print(lang === 'en' ? 'No such directory' : 'Diretório não encontrado')
          }
        }
        break
      case 'cat': {
        const target = args[0]
        if (!target) {
          print(lang === 'en' ? 'Missing file name' : 'Nome do arquivo ausente')
          break
        }
        const path = cwd === '/' ? target : `${cwd}/${target}`
        const content = currentFS[path]
        if (content) {
          print(content)
        } else {
          print(lang === 'en' ? 'File not found' : 'Arquivo não encontrado')
        }
        break
      }
      case 'clear':
        clear()
        break
      case 'help':
        if (lang === 'en') {
          print('Available commands: \nls\ncd <dir>\ncat <file.txt>\nclear\nhelp')
        } else {
          print('Comandos disponíveis: \nls\ncd <dir>\ncat <file.txt>\nclear\nhelp')
        }
        break
      case 'show': {
        const fullPaths = fs[lang]['/']
        for (const item of fullPaths) {
          const fullPath = cwd === '/' ? item : `${cwd}/${item}`
          const content2 = fs[lang][fullPath]
          if (Array.isArray(fs[lang][`/${item.replace('.txt', '')}`])) {
            const subdir = `/${item.replace('.txt', '')}`
            print(`\n📁 ${item}`)
            for (const subfile of fs[lang][subdir]) {
              const subpath = `${subdir}/${subfile}`
              print(`\n📄 ${subfile}`)
              print(fs[lang][subpath])
            }
          } else {
            print(`\n📄 ${item}`)
            print(content2)
          }
        }
        break
      }
      default:
        print(lang === 'en' ? 'Command not found' : 'Comando não encontrado')
    }
  }

  const runCommand = (cmd) => {
    print(`$ ${cmd}`)
    handleCommand(cmd)
    setHistory((h) => {
      const newHist = [...h, cmd]
      setHistoryIndex(newHist.length)
      return newHist
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const cmd = command
      setCommand('')
      if (cmd) {
        runCommand(cmd)
      }
    } else if (event.key === 'ArrowUp') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(history[newIndex])
      }
      event.preventDefault()
    } else if (event.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(history[newIndex])
      } else {
        setHistoryIndex(history.length)
        setCommand('')
      }
      event.preventDefault()
    }
  }

  return (
    <div className="terminal">
      <label htmlFor="lang"><span className="prompt">🌐</span></label>
      <select id="lang" value={lang} onChange={(e) => {setLang(e.target.value); setCwd('/'); clear();}}>
        <option value="en">🇺🇸 English</option>
        <option value="pt">🇧🇷 Português</option>
      </select>
      <div className="button-panel">
        {buttons[lang].map((b) => (
          <button
            key={b.label}
            className="terminal-button"
            onClick={() => b.cmds.forEach(runCommand)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div id="output" className="output" ref={outputRef}>
        {output.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
      <div className="input-line">
        <span className="prompt">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  )
}
