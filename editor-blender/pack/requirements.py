def install_requirements():
    import subprocess
    import sys

    requirements = [
        "gql[all]",
        "dataclass_wizard",
        "aiohttp",
        "python-dotenv",
        "typeguard",
    ]

    command = [sys.executable, "-m", "pip", "install"] + requirements
    subprocess.check_call(command)
