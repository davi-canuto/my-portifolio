import { useState, useEffect, useRef } from 'react'
import './Terminal.css'

const fs = {
  en: {
    '/': ['skills', 'projects', 'about.txt', 'contact.txt'],
    '/projects': ['school-api.txt', 'booking-system.txt'],
    '/skills': ['soft.txt', 'hard.txt'],
    'about.txt': "Hello! I'm Davi Canuto, a backend developer focused on REST APIs, Ruby on Rails, and testing.",
    'contact.txt': "Email: davialessandro33@gmail.com\nLinkedIn: https://linkedin.com/in/davi-canuto-b10ab11b7\nGithub: https://github.com/davi-canuto",
    '/skills/soft.txt': "tuémano",
    '/skills/hard.txt': "Ruby, Rails, PostgreSQL, Docker, TDD, CI/CD",
    '/projects/school-api.txt': "School API: RESTful API for managing school data. GitHub: https://github.com/seuusuario/api-escolar",
    '/projects/booking-system.txt': "Booking System: Platform for resource reservations. GitHub: https://github.com/seuusuario/reservas",
  },
  pt: {
    '/': ['sobre.txt', 'habilidades.txt', 'projetos', 'contato.txt'],
    '/projetos': ['api-escolar.txt', 'sistema-reservas.txt'],
    '/habilidades': ['pessoals.txt', 'tecnico.txt'],
    'sobre.txt': "Olá! Eu sou Davi Canuto, desenvolvedor backend focado em APIs REST, Ruby on Rails e testes.",
    'contato.txt': "Email: davialessandro33@gmail.com\nLinkedIn: https://linkedin.com/in/davi-canuto-b10ab11b7",
    '/habilidades/pessoal.txt': "tuémano",
    '/habilidades/tecnico.txt': "Ruby, Rails, PostgreSQL, Docker, TDD, CI/CD",
    '/projetos/api-escolar.txt': "API Escolar: API RESTful para gerenciamento escolar. GitHub: https://github.com/seuusuario/api-escolar",
    '/projetos/sistema-reservas.txt': "Sistema de Reservas: Plataforma de reservas de recursos. GitHub: https://github.com/seuusuario/reservas"
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const cmd = command
      setCommand('')
      if (cmd) {
        print(`$ ${cmd}`)
        handleCommand(cmd)
        setHistory([...history, cmd])
        setHistoryIndex(history.length + 1)
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
