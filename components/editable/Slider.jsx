"use client"

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import Imagen1 from "/public/HTML.png";
import Imagen2 from "/public/CSS.png";
import Imagen3 from "/public/JS.png";
import Imagen4 from "/public/BOOTSTRAP.png";
import Imagen5 from "/public/PHP.png";
import Imagen6 from "/public/MySQL.png";
import Link from "next/link";

const post = [
  {
    imagen: Imagen1,
    titulo: 'HTML',
    texto: 'En este curso básico de HTML, aprenderás todo lo necesario para elaborar paginas web'
  },
  {
    imagen: Imagen2,
    titulo: 'CSS',
    texto: 'En este curso básico de CSS, aprenderás como asignar estilos visuales a cada pagina web'
  },
  {
    imagen: Imagen3,
    titulo: 'JavaScript',
    texto: 'En este curso básico de JavaScript, aprenderás como interactuar entre diferentes elementos'
  },
  {
    imagen: Imagen4,
    titulo: 'Bootstrap',
    texto: 'En este curso básico de Bootstrap, aprenderás a integrar este framework a tu sitio web'
  },
  {
    imagen: Imagen5,
    titulo: 'PHP',
    texto: 'En este curso básico de PHP, aprenderás el lenguaje fundamental detras del servidor'
  },
  {
    imagen: Imagen6,
    titulo: 'MySQL',
    texto: 'En este curso básico de MySQL, te enseñamos a conectar tu sitio web a una base de datos'
  }
]

export default function Slider() {

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    speed: 500,
    autoplaySpeed: 5000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  function EliminarCaracteres(str) {
    str = str.replace(/<\/?[^>]+>/g, "");
    return str.replace(/ <\/?[^]+/g, "");
  }

  return (
    // ===START_RETURN===
    <div className="slider text-center p-4">
      <Slider {...settings}>
        {
          post.map((post, index) => {
            return (
              <Link key={index} href="#">
                <div className="border-2 border-blue-600 rounded-xl max-[420px]:px-2 max-[420px]:py-4 md:px-4 m-auto w-11/12 h-90">
                  <div className="m-auto max-[420px]:w-20 md:w-28 max-[420px]:h-24 md:h-32 justify-center flex">
                    <Image className="m-auto w-full object-scale-down" src={post.imagen} alt={post.imagen} width={200} height={200} />
                  </div>
                  <h2 className="text-3xl py-2">{post.titulo}</h2>
                  <p>{EliminarCaracteres(post.texto).slice(0, 84)}...</p>
                </div>
              </Link>
            )
          })
        }
      </Slider>
    </div>
    // ===END_RETURN===
  )
}