import React from 'react';
import { Code2, Database, Globe, Smartphone, Server, Palette, GitBranch, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  FaReact, FaAngular, FaNodeJs, FaPhp, FaDocker, FaGitAlt, FaApple, FaAndroid,FaProjectDiagram,FaDatabase 
} from 'react-icons/fa';
import {
  SiTypescript, SiTailwindcss, SiSass, SiPython, SiMongodb, SiPostgresql,
  SiExpress, SiDotnet, SiGraphql, SiIonic, SiFlutter, SiOracle, SiSupabase,
  SiJest, SiWebpack,SiZapier
} from 'react-icons/si';
import { AiOutlineApi } from "react-icons/ai";
import { BiNetworkChart } from "react-icons/bi";
import { RiShareBoxLine } from "react-icons/ri";




const Skills = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const skillCategories = [
    {
      title: 'Frontend Development',
      titleFr: 'Développement Frontend',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      skills: [

        { name: 'TypeScript', icon: SiTypescript },
        { name: 'React', icon: FaReact },
        { name: 'Angular', icon: FaAngular },

      ]
    },
    {
      title: 'Backend Development',
      titleFr: 'Développement Backend',
      icon: Server,
      color: 'from-green-500 to-emerald-500',
      skills: [
        { name: 'ASP.NET', icon: SiDotnet },
        { name: 'REST API', icon: AiOutlineApi },

      ]
    },
    {
      title: 'Mobile Development',
      titleFr: 'Développement Mobile',
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      skills: [
        { name: 'Ionic', icon: SiIonic },

      ]
    },
    {
      title: 'Database & Cloud',
      titleFr: 'Base de Données & Cloud',
      icon: Database,
      color: 'from-orange-500 to-red-500',
      skills: [
        { name: 'MongoDB', icon: SiMongodb },
        { name: 'PostgreSQL', icon: SiPostgresql },
        { name: 'SQL Server', icon: FaDatabase  },
        { name: 'Supabase', icon: SiSupabase },

      ]
    },
    {
      title: 'Tools & DevOps',
      titleFr: 'Outils & DevOps',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      skills: [
        { name: 'Git', icon: FaGitAlt },

        { name: 'n8n', icon: FaProjectDiagram  },


      ]
    },
  ];

  const allSkills = skillCategories.flatMap(category => category.skills);

  /**
   * 
   */
  return (
    <section id="skills" className="py-20 section-bg">
      <div className="container mx-auto px-4">
        <div ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('skills.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('skills.description')}
            </p>
          </div>

          {/* Big Grid of All Skills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {allSkills.map((skill, index) => (
              <div
                key={skill.name}
                className={`group flex flex-col items-center p-4 rounded-xl bg-primary-light hover:bg-primary transition-all duration-300 cursor-default ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
              >
                <skill.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors duration-300 mb-2" />
                <span className="text-sm font-medium text-primary group-hover:text-white text-center leading-tight">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>



        </div>
      </div>
    </section>
  );
};

export default Skills;